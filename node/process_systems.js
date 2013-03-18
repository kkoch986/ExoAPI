var fs = require('fs');
var libxmljs = require("libxmljs");
var sys = require('util')
var exec = require('child_process').exec;
var child;

function pullUpdate()
{
	console.log("Performing Pull Update...");
	child = exec("cd ../exo_data && git pull; curl http://nanobio.hpcf.upr.edu/~amendez/phl/phl_hec_all_confirmed.csv -o ../exo_data/data.csv -#", function (error, stdout, stderr) {
	  console.log('stdout: ' + stdout);
	  console.log('stderr: ' + stderr + "\n\n");
	  if (error !== null) {
	    console.log('exec error: ' + error);
	  }

	  console.log("Update Complete.");
	  // now connect the database
	  connectDB();

	});
}

var mongodb = require("mongodb"),
		mongoserver = new mongodb.Server("localhost", 12002),
		//mongoserver = new mongodb.Server("172.16.3.30", 27017),
		db_connector = new mongodb.Db("v3", mongoserver, {safe:false});

function connectDB()
{
	/* Connect to Mongo */
	var UPDATE_FREQ = 360000;
	db_connector.open(openCollection);
	setTimeout(pullUpdate, UPDATE_FREQ);
}

function openCollection(err, db)
{
	if(err != undefined)
		console.log(err);
	db.collection("systems", startParsing);
}

function startParsing(err, collection)
{
	/* Start by loading a list of all Planets in The /data folder. */
	var files = fs.readdirSync("../exo_data/data/systems");

	console.log("[" + new Date() + "] Begin Update");
	var x = 0;
	for( ; x < files.length ; x++)
	{
		var text = fs.readFileSync("../exo_data/data/systems/" + files[x], "UTF-8");
		var xml = libxmljs.parseXmlString(text);
		
		var id = xml.get("//name").text();
		var object = parseElement(xml.root());
		delete object.id;
		object._id = id;

		collection.save(object);
	}
	console.log("[" + new Date() + "] Complete Update ("+x+") Records Processed");
	db_connector.close();
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
			subelement[node.name()] = parseElement(node);
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