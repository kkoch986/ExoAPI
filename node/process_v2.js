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
		db_connector = new mongodb.Db("skyhook", mongoserver);
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
	db.collection("planets", startParsing);
}


function startParsing(err, collection)
{
	if(err != undefined)
		console.log(err);

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

	var count = 0;
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

		// now bring in fields from the XML data
		// star.angulardistance
		// star.magV
		// star.magI
		// star.magH
		// star.magJ
		// star.magK
		// image
		// image description
		// multiplicity
		// lastupdated?
		// new ?
		try
		{
			var text = fs.readFileSync("../exo_data/data/data/" + object._id + ".xml", "UTF-8");
			var xml = libxmljs.parseXmlString(text);
			
			object.image = xml.get("//image").text();
			object.imagedescription = xml.get("//imagedescription").text();
			object.multiplicity = xml.get("//multiplicity").text();
			object.star.angulardistance = xml.get("//star/angulardistance").text();

			object.star.magV = xml.get("//star/magV").text();
			object.star.magI = xml.get("//star/magI").text();
			object.star.magH = xml.get("//star/magJ").text();
			object.star.magJ = xml.get("//star/magH").text();
			object.star.magK = xml.get("//star/magK").text();

			// make sure numbers are recorded as numbers not strings
			if(isNumber(object.multiplicity)) object.multiplicity = Number(object.multiplicity);
			if(isNumber(object.star.angulardistance)) object.star.angulardistance = Number(object.star.angulardistance);
			if(isNumber(object.star.magV)) object.star.magV = Number(object.star.magV);
			if(isNumber(object.star.magI)) object.star.magI = Number(object.star.magI);
			if(isNumber(object.star.magH)) object.star.magH = Number(object.star.magH);
			if(isNumber(object.star.magJ)) object.star.magJ = Number(object.star.magJ);
			if(isNumber(object.star.magK)) object.star.magK = Number(object.star.magK);

		} catch(e) {
			// plug in emtpy values for these entrys
			object.image = "";
			object.imagedescription = "";
			object.multiplicity = "";
			object.star.angulardistance = "";
			object.star.magV = "";
			object.star.magI = "";
			object.star.magH = "";
			object.star.magJ = "";
			object.star.magK = "";
		}

		collection.save(object);

		count ++;
	}
	console.log("Done, " + count + " records processed.");
	db_connector.close();
}


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

pullUpdate();
