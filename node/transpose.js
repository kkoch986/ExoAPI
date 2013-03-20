// MONGODB CODE TO EXTRACT PLANETS FROM THE SYSTEMS TABLE INTO A PLANETS TABLE
// Work in progress...

// db.systems.find( { "star.planet": { $exists: true }  }, { "star.planet":1, "_id":0 } ).length()
// db.systems.find( { "binary.star.planet": { $exists: true }  }, { "binary.star.planet":1, "_id":0 } ).length()
// db.systems.find( { "binary.binary.star.planet": { $exists: true }  }, { "binary.binary.star.planet":1, "_id":0 } ).length()
	
var mapPlanetFunction = function(planet) { 
		if(planet instanceof Array)
		{
			for (var i = planet.length - 1; i >= 0; i--) {
				mapPlanetFunction(planet[i]);
			};
			return ;
		}

		if(planet == null || planet.name == null)
			return; 

		planet._id = (planet.name instanceof Array) ? planet.name[0] : planet.name; 

		db.planets.save(planet); 
	}

// get the basic star.planet case
db.systems.find( { "star.planet": { $exists: true }  }, { "star.planet":1, "_id":0 } ).forEach( function(x){ 
	if(x.star instanceof Array) {
		for (var i = x.star.length - 1; i >= 0; i--) {
			mapPlanetFunction(x.star[i].planet);
		};
	}
	else
		mapPlanetFunction(x.star.planet); 
} );

// get the binary.star.planet cases
db.systems.find( { "binary.star.planet": { $exists: true }  }, { "binary.star.planet":1, "_id":0 } ).forEach( function(x){ 
	if(x.binary instanceof Array)
	{
		for (var i = x.binary.length - 1; i >= 0; i--) {
			if(x.binary[i].star instanceof Array)
			{
				for (var j = x.binary[j].star.length - 1; j >= 0; j--) {
					mapPlanetFunction(x.binary[i].star[j].planet);
				};
			}
			else
			{
				mapPlanetFunction(x.binary[i].star.planet); 
			}
		};
	}
	else
	{
		if(x.binary.star instanceof Array)
		{
			for (var j = x.binary.star.length - 1; j >= 0; j--) {
					mapPlanetFunction(x.binary.star[j].planet);
			};
		}
		else
		{
			mapPlanetFunction(x.binary.star.planet); 
		}
	}
});

// currently this doesnt happen, there are binary.binary.star but none have planets
// db.systems.find( { "binary.binary.star.planet": { $exists: true }  }, { "binary.binary.star.planet":1, "_id":0 } ).forEach( function(x){ mapPlanetFunction(x.binary.binary.star.planet); } );

// //// Compute the Average mass per planet on each planet list (note: doesnt return correctly for lists or kepler list planets)
// var mapFunction = function() { 
// 		if(this.mass != 0)
// 	 		emit({list:this.list}, this.mass);
// }

// var reduceFunction = function(planetList, masses) {
//   return Array.sum(masses) / masses.length;
// };

// db.planets.mapReduce( mapFunction, reduceFunction, {out: "average_mass_by_list"} );

// //// Compute the number of planets discovered using each discovery method during each year
// var mapFunction = function() {
// 	emit({year: this.discoveryyear, method: this.discoverymethod}, 1);
// }

// var reduceFunction = function(year_and_method, planets) {
//   return planets.length;
// };

// db.planets.mapReduce( mapFunction, reduceFunction, {out: "total_by_year_and_method"} );




