Tasks = new Mongo.Collection("tasks");
Distances = new Mongo.Collection("distances");


if (Meteor.isServer) {
  Meteor.startup(function () {
	return Meteor.methods({
	  removeDistances: function () {
		return Distances.remove({});
	  }
	});
  });
}


if (Meteor.isClient) {
 // This code only runs on the client
 Template.body.helpers({ tasks: function () { // Show newest tasks at the top 
Meteor.call('removeDistances');
	return Tasks.find({}, {sort: {createdAt: -1}}); }
 });
Template.body.helpers({ distances: function () { // Show shortest distances at the top 
	return Distances.find({}, {sort: {distance: 1}}); }
 });
Template.body.helpers({
    loc: function () {
      // return 0, 0 if the location isn't ready
      return Geolocation.latLng() || { lat: 0, lng: 0 };
    },
    error: Geolocation.error
    
  });
Template.body.events({ "click .new-task input[id=add]": function (event,t) { // Prevent default browser form submit
//	alert("add");
        	
	event.preventDefault();
	var lats = t.$("form.new-task input[name=lat]").val();
	var lons = t.$("form.new-task input[name=lon]").val();
	var name = t.$("form.new-task input[name=name]").val();
       



	Meteor.call('removeDistances');
	Tasks.insert({ name: name,latitude: lats,longitude: lons, createdAt: new Date()},function (error,result) {
	if(error)
		alert("error");	
	if(result)
	{
	}
	});
	}});


Template.body.events({ "click .new-task input[id=calculate]": function (event,t) { // Prevent default browser form submit
	event.preventDefault();
//	alert("calculate");
	var lats = t.$("form.new-task input[name=lat]").val();
	var lons = t.$("form.new-task input[name=lon]").val();
	//alert(lats+" "+lons);
	Meteor.call('removeDistances');
	Tasks.find().forEach( function(location) {
			if(lats==location.latitude && lons==location.longitude)
			{
				return;
			}
			var origin = {lat: parseFloat(lats), lng: parseFloat(lons)}
			var destination = {lat:  parseFloat(location.latitude) , lng: parseFloat(location.longitude)};
			getDistance(origin,destination,location.name);
		});
	}});


function getDistance(origin,destination,name)
{
//	alert(origin.lat + " " + origin.lng+" "+destination.lat + " " + destination.lng);
	var service = new google.maps.DistanceMatrixService(); //initialize the distance service
	service.getDistanceMatrix(
	   {
	     origins: [origin], //set origin, you can specify multiple sources here
	     destinations: [destination],//set destination, you can specify multiple destinations here
	     travelMode: google.maps.TravelMode.DRIVING, //set the travelmode
	     unitSystem: google.maps.UnitSystem.METRIC,//The unit system to use when displaying distance
	     avoidHighways: false,
	     avoidTolls: false
	}, function(response, status) {
		if (status != google.maps.DistanceMatrixStatus.OK) { // check if there is valid result
		   alert('Error was: ' + status);
		 } else {
			   var origins = response.originAddresses;
			   var destinations = response.destinationAddresses;
			   for (var i = 0; i < origins.length; i++) {
			     var results = response.rows[i].elements;
			     for (var j = 0; j < results.length; j++) {//map names with distances
				Distances.insert({name: name, distance: results[j].distance.text,createdAt: new Date()},function (error,result) {
					if(error)
						alert("error");
					if(result)
					{
					}
				});
			     }
		   }
  	}
}); 
}
Template.task.events({  // Set the checked property to the opposite of its current value 
 "click .delete": function () { Tasks.remove(this._id); } }); 

Template.distance.events( {"click .delete2": function () { Distances.remove(this._id); } });



}

