var terminal = require('child_process').spawn('cmd');
var fs = require('fs');
var libxmljs = require("libxmljs");

terminal.stdout.on('cd ../exo_data && git pull', function (data) {
    console.log('stdout: ' + data);
});

/* Connect to Mongo */
var mongodb = require("mongodb"),
	//mongoserver = new mongodb.Server("174.122.110.37", 12002),
	mongoserver = new mongodb.Server("172.16.3.30", 27017),
	db_connector = new mongodb.Db("test", mongoserver);

var UPDATE_FREQ = 60000; // one minute ?


db_connector.open(openCollection);

setInterval(function(){
	db_connector.open(openCollection);
}, UPDATE_FREQ);


function openCollection(err, db)
{
	console.log(err);
	db.collection("planets", startParsing);
}


function startParsing(err, collection)
{
	if(err != undefined)
		console.log(err);

	/* Start by loading a list of all Planets in The /data folder. */
	var files = fs.readdirSync("../exo_data/data/data");
	//console.log(files);

	console.log("[" + new Date() + "] Begin Update");
	var x = 0;
	for( ; x < files.length ; x++)
	{
		var text = fs.readFileSync("../exo_data/data/data/" + files[x], "UTF-8");
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
			if(isNumber(node.text())) return Number(node.text());
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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}