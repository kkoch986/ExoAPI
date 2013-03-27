////////// SCHEMA ANALYSIS //////////////
var isArray = function (v) {
  return v && typeof v === 'object' && typeof v.length === 'number' && !(v.propertyIsEnumerable('length'));
}

var schemaRecurse = function(base, value){
	var intRegex = /^\d+$/;
	for(var key in value) {
		if((intRegex.test(key)))
		{
			if( isArray(value[key]) || typeof value[key] == 'object') {
				schemaRecurse(base, value[key]);
			}
		}
		else
		{	
			emit(base + "." + key, 1);
			if( isArray(value[key]) || typeof value[key] == 'object') {
				schemaRecurse(base + "." + key, value[key]);
			}
		}
	}
}

db.system.js.save( { _id : "isArray", value : isArray } );
db.system.js.save( { _id : "schemaRecurse", value : schemaRecurse } );

var mapSchema = function(){
	for(var key in this) {
		emit(key, 1);

		if( isArray(this[key]) || typeof this[key] == 'object' ) {
			schemaRecurse(key, this[key]);
		}
	}
}

var reduceSchema = function(key, stuff) { 
	return Array.sum(stuff);
}

// to get the fields for a given collection
var getKeys = function(collection, out) { collection.mapReduce(mapSchema, reduceSchema, { "out":out } ); }

db.schema.stars.drop()
db.schema.planets.drop()
db.schema.systems.drop()
getKeys(db.stars, "schema.stars");
getKeys(db.planets, "schema.planets");
getKeys(db.systems, "schema.systems");


