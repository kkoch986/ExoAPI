var fs = require('fs');
var libxmljs = require("libxmljs");
var sys = require('util')
var exec = require('child_process').exec;
var child;
var UPDATE_FREQ = 360000;

var startTime;

function pullUpdate()
{
	startTime = (new Date()).valueOf();
	console.log("Performing Pull Update...");
	child = exec("cd ../exo_data && git pull; curl http://nanobio.hpcf.upr.edu/~amendez/phl/phl_hec_all_confirmed.csv -o ../exo_data/data.csv -#", function (error, stdout, stderr) {
	  console.log('stdout: ' + stdout);
	  console.log('stderr: ' + stderr + "\n\n");
	  if (error !== null) {
	    console.log('exec error: ' + error);
	  }

	  console.log("[" + new Date() + "] Update Complete.");
	  // now connect the database
	  connectDB();

	});
}

var mongodb = require("mongodb"),
		mongoserver = new mongodb.Server("localhost", 12002),
		//mongoserver = new mongodb.Server("172.16.3.30", 27017),
		db_connector = new mongodb.Db("v3", mongoserver, {safe:false});

var _db;
function connectDB()
{
	/* Connect to Mongo */
	db_connector.open(openCollection);
}

function openCollection(err, db)
{
	if(err != undefined)
		console.log(err);
	_db = db;
	db.collection("systems", startParsing);
}

function startParsing(err, collection)
{
	/* Start by loading a list of all Planets in The /data folder. */
	var files = fs.readdirSync("../exo_data/data/systems");

	console.log("[" + new Date() + "] Begin Update");
	var count = 0;
	for(var x = 0 ; x < files.length ; x++)
	{
		var text = fs.readFileSync("../exo_data/data/systems/" + files[x], "UTF-8");
		var xml = libxmljs.parseXmlString(text);
		
		var id = xml.get("//name").text();
		var object = parseElement(xml.root());
		delete object.id;
		object._id = id;

		count++;
		collection.save(object);
	}

	var files = fs.readdirSync("../exo_data/data/systems_kepler");
	for(var x = 0 ; x < files.length ; x++)
	{
		var text = fs.readFileSync("../exo_data/data/systems_kepler/" + files[x], "UTF-8");
		var xml = libxmljs.parseXmlString(text);
		
		var id = xml.get("//name").text();
		var object = parseElement(xml.root());
		delete object.id;
		object._id = id;

		count++;
		collection.save(object);
	}

	// Now process the CSV file
	var text = fs.readFileSync("../exo_data/data.csv", "UTF-8");
	var lines = text.split("\n");

	// the first line will be the fields for each successive line
	var fields = lines[0].split(",");
	for(var x = 0 ; x < fields.length ; x++)
	{
		var prefix = fields[x].substr(0, 2);
		var name = fields[x].substr(3, fields[x].length).replace(/\([a-zA-Z0-9].*\)/, "").trim().split(".").join("").split(" ").join("_");
		fields[x] = (prefix + "_" + name).toLowerCase();
		
		// also handle some special cases here i.e. [fe/h]
		if(fields[x] == "s._[fe/h]") fields[x] = "s._metallicity";
	}

	console.log("[" + new Date() + "] Complete Systems Update ("+count+") Records Processed");

	_db.collection("systems", function(err, collection){
		count = 0;
		for(var x = 1; x < lines.length; x++)
		{
			var values = lines[x].split(",");
			// construct an object out of each index in the fields array
			if(values.length != fields.length) continue ;

			var object = {"star":{}};
			for(var y = 0; y < values.length; y++)
			{
				if(fields[y].substr(0, 3) == "s._")
				{
					var fname = fields[y].substr(3, fields[y].length);
					if(isNumber(values[y])) values[y] = Number(values[y]);
					object.star[fname] = values[y];
				}
				else if(fields[y].substr(0, 3) == "p._")
				{
					var fname = fields[y].substr(3, fields[y].length);
					if(isNumber(values[y])) values[y] = Number(values[y]);
					object[fname] = values[y];
				}
				else
					object[fields[y]] = values[y];
			}

			object._id = object.name;
			collection.save(object);
			count++;
		}

		console.log("[" + new Date() + "] Complete Additional Planet Update ("+count+") Records Processed");
		db_connector.close();

		// Run the planet/system/star extractor
		console.log("[" + new Date() + "] Running System/Planet Extractor.");
		exec("mongo localhost:12002/v3 transpose.js", function (error, stdout, stderr) {
			if (error !== null)
				console.log('exec error: ' + error);
			console.log("[" + new Date() + "] System/Planet Extractor Complete.");

			// run the schema extractor
			console.log("[" + new Date() + "] Running Data Schema Extractor.");
			exec("mongo localhost:12002/v3 schema.js", function (error, stdout, stderr) {
				if (error !== null)
					console.log('exec error: ' + error);
				console.log("[" + new Date() + "] Data Schema Extractor Complete.");

				var endTime = (new Date()).valueOf();
				console.log("[" + new Date() + "] Total Update Time: " + (endTime - startTime) + "ms (next round in " + UPDATE_FREQ + " ms)");

				// set the time out for the next round of extraction
				setTimeout(pullUpdate, UPDATE_FREQ);
			});
		});
	});
}

/** a recursive function for parsing an xml element into a json object. */
function parseElement(element)
{
	// otherwise, we will need to recurse to compute the subtree of this element
	var subelement = {};
	for(var x = 0; x < element.childNodes().length; x++)
	{
		var node = element.childNodes()[x];
		if(node.name() == "text") 
		{
			if(node.text().toString().trim() == "") continue;
			if(isNumber(node.text())) return Number(node.text());
			return node.text().toString();
		}
		else
		{
			// check that there isnt already something here
			if(subelement[node.name()] != undefined)
			{
				// check if theres an array here already
				if(subelement[node.name()] instanceof Array)
					subelement[node.name()].push(parseElement(node))
				else
				{
					var temp = subelement[node.name()];
					subelement[node.name()] = [temp, parseElement(node)];
				}
			}
			else
				subelement[node.name()] = parseElement(node);
		}
	}
	return subelement;
}

pullUpdate();

function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    console.log(out);
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}