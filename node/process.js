
var mongodb = require("mongodb"),
    mongoserver = new mongodb.Server("localhost", 27017),
    db_connector = new mongodb.Db("space", mongoserver);

db_connector.open(function(err, db){
    //db.collection(...);
    console.log("Were in Bra");
});