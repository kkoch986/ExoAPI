var fs = require('fs');
var libxmljs = require("libxmljs");

/* Connect to Mongo */
var mongodb = require("mongodb"),
	mongoserver = new mongodb.Server("localhost", 27017),
	db_connector = new mongodb.Db("test", mongoserver);

var UPDATE_FREQ = 60000; // one minute ?


setInterval(function(){
	db_connector.open(openCollection);
}, UPDATE_FREQ);


function openCollection(err, db)
{
	db.collection("planets", startParsing);
}


function startParsing(err, collection)
{
	if(err != undefined)
		console.log(err);

	/* Start by loading a list of all Planets in The /data folder. */
	var files = fs.readdirSync("../../data/data/");
	//console.log(files);

	console.log("[" + new Date() + "] Begin Update");
	var x = 0;
	for( ; x < files.length ; x++)
	{
		var text = fs.readFileSync("../../data/data/" + files[x], "UTF-8");
		var xml = libxmljs.parseXmlString(text);
		
		var id = xml.get("//id").text();
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
			return node.text().toString();
		}
		else
			subelement[node.name()] = parseElement(node);
	}
	return subelement;
}




function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }

    console.log(out);
}