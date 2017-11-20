///////////////////////////////
/// Google MAP API routines
///////////////////////////////

var geocoder;
var map;
var driveStart = Array();
var driveEnd = Array();
var infos = Array();
var destinations = Array();


function initialize() {
    // prepare Geocoder
    geocoder = new google.maps.Geocoder();

    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(40.7143528,-74.0059731);        
    var myOptions = { // default map options
        zoom: 8,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
        function(position) {
            myLatlng = new google.maps.LatLng(position.coords.latitude,
                                              position.coords.longitude);
            map.setCenter(myLatlng);
        });
    }
    
    //var lMarker = new google.maps.Marker({
    //    position: myLatlng,
    //    map: map
    //});
    //markers.push(lMarker);
}

// clear overlays function
function clearOverlay() {
    if (driveStart) {
        for (i in driveStart) {
            driveStart[i].setMap(null);
        }
        driveStart = [];
    }
    if (driveEnd) {
        for (i in driveEnd) {
            driveEnd[i].setMap(null);
        }
        driveEnd = [];
    }
}

// clear infos function
function clearInfos() {
    if (infos) {
        for (i in infos) {
            if (infos[i].getMap()) {
                infos[i].close();
            }
        }
    }
}



function setStartLoc(markerIndex, elementId) {
    var address = document.getElementById(elementId).value;

    // script uses our 'geocoder' in order to find location by address name
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) 
        { // and, if everything is ok
            // we will center map
            var addrLocation = results[0].geometry.location;
            
            //var markerIndex = 0; 
            
            if(driveStart.length > markerIndex) {
                driveStart[markerIndex].setPosition(addrLocation);
            }
            else 
            {
                var lMarker = new google.maps.Marker({
                    position: addrLocation,
                    map: map,
                    title: results[0].formatted_address
                });
                driveStart.push(lMarker);
            }
            map.setCenter(addrLocation);
			var textField = document.getElementById(elementId);
			// both lines below are needed. First line sets up the display and the second preserves the value
            textField.value = results[0].formatted_address;
			textField.setAttribute("value", results[0].formatted_address);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function setEndLoc(markerIndex, elementId, r) {
    //var address = document.getElementById(elementId).value;
    var address = r.value;
    // script uses our 'geocoder' in order to find location by address name
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) 
        { // and, if everything is ok
            // we will center map
            var addrLocation = results[0].geometry.location;
            
            //var markerIndex = 0; 
            
            if(driveEnd.length > markerIndex) {
                driveEnd[markerIndex].setPosition(addrLocation);
            }
            else 
            {
                var lMarker = new google.maps.Marker({
                    position: addrLocation,
                    map: map,
                    title: results[0].formatted_address
                });
                driveEnd.push(lMarker);
            }
            map.setCenter(addrLocation);
			//var strCell = r.parentNode.innerHTML;
			//var strReplace = strCell.replace('value=""', 'value="'+results[0].formatted_address+'"');
			//r.parentNode.innerHTML = strReplace;
			
            var textField = document.getElementById(elementId);
			
			// both lines below are needed. First line sets up the display and the second preserves the value
            textField.value = results[0].formatted_address;
			textField.setAttribute("value", results[0].formatted_address);
        } 
        else {
            alert('Geocode was not successful for the following reason: ' + status);
        }

    });
}



function setDestinations() {

    destinations = [];
    
    // get table
    var destTbl = document.getElementById("DestinationTbl");
    var rowCount = destTbl.rows.length;
    var finalDest;
    // for each odd row
    for (var i=1; i<rowCount; i+=2)  
    {
        // get cell address value and use geocode 
        var address = document.getElementById("gmap_where"+i).value;
        // if correct, store in the destinations array
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok
                // we will center map
                //destinations.push(results[0]);
                finalDest = results[0];
                if (destinations.length==0) alert("push failed 1");
            } // end if status is ok 
            else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
                if (destinations.length==0) alert("push failed 2");
        }); // end geocoder       
        //destinations.push(finalDest);
        if (destinations.length==0) alert("push failed 3");
    } // end for
    
    alert("array lengths not correct "+destinations.length+" "+rowCount);        
}

function loadOverlay() {

    // for each destination in array
    for(var i=0; destinations.length; i++)
    {
        // create a marker for the destionation and add it to the markers list
        var lMarker = new google.maps.Marker({
            position: destinations[i].geometry.location,
            map: map,
            title: destinations[i].formatted_address
            });
        markers.push(lMarker);

        // draw a polyline
    }
    // center the map
    map.setCenter(destinations[0].geometry.location);
}




// find custom places function
function findPlaces() {

    // prepare variables (filter)
    var type = document.getElementById('gmap_type').value;
    var radius = document.getElementById('gmap_radius').value;
    var keyword = document.getElementById('gmap_keyword').value;

    var lat = document.getElementById('lat').value;
    var lng = document.getElementById('lng').value;
    var cur_location = new google.maps.LatLng(lat, lng);

    // prepare request to Places
    var request = {
        location: cur_location,
        radius: radius,
        types: [type]
    };
    if (keyword) {
        request.keyword = [keyword];
    }

    // send request
    service = new google.maps.places.PlacesService(map);
    service.search(request, createMarkers);
}



// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

        // if we have found something - clear map (overlays)
        clearOverlay();

        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('Sorry, nothing is found');
    }
}

// creare single marker function
function createMarker(obj) {

    // prepare new Marker object
    var mark = new google.maps.Marker({
        position: obj.geometry.location,
        map: map,
        title: obj.name
    });
    markers.push(mark);

    // prepare info window
    var infowindow = new google.maps.InfoWindow({
        content: '<img src="' + obj.icon + '" /><font style="color:#000;">' + obj.name + 
        '<br />Rating: ' + obj.rating + '<br />Vicinity: ' + obj.vicinity + '</font>'
    });

    // add event handler to current marker
    google.maps.event.addListener(mark, 'click', function() {
        clearInfos();
        infowindow.open(map,mark);
    });
    infos.push(infowindow);
}


//////////////////////////////////////////
/// Routines to handle Destination table
//////////////////////////////////////////
function addDestTblRow(r) {
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
    var rowIndex = destTbl.rows.length-1;
    
	// clear the add ... cell in the current last row before
	// adding a new one
	//destTbl.rows[(rowCount-1)].cells[4].innerHTML = "&nbsp;";
	
    var row = destTbl.insertRow(rowIndex);
    //var cell1 = row.insertCell(0); // Day X
    var driveCell = row.insertCell(0); // Drive
    var fromCell = row.insertCell(1); // From
    var startToEndCell = row.insertCell(2); // Start to Dest
	var btnCell = row.insertCell(3); // Add Drive/Meal/Stay
    
    driveCell.innerHTML = 'Drive';
	fromCell.innerHTML = 'From';
    startToEndCell.innerHTML = '<input id="start_loc_1_'+rowIndex+'" type="text" name="start_loc_1_'+rowIndex+'" onChange="setStartLoc('+rowIndex+',\'start_loc_1_'+rowIndex+'\'); return false;"> To <input id="end_loc_1_'+rowIndex+'" type="text" name="end_loc_1_'+rowIndex+'" onChange="setEndLoc('+rowIndex+',\'end_loc_1_'+rowIndex+'\',this);  return true;">';

	btnCell.innerHTML = '<input type="image" src="icons/delete.png" width="15" width="15" alt="Delete" onclick="delRow(this);return false;"> <input type="image" src="icons/up.png" width="15" width="15" alt="Up" onclick="upRow(this);return false;"> <input type="image" src="icons/down.png" width="15" width="15" alt="down" onclick="downRow(this);return false;">';
    
}

function addMealRow(r) {
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
    var rowIndex = destTbl.rows.length-1;
    
    var row = destTbl.insertRow(rowIndex);
    //var cell1 = row.insertCell(0); // Day X
    var eatCell = row.insertCell(0); // Drive
    var atCell = row.insertCell(1); // From
    var mealCell = row.insertCell(2); // Start to Dest
	var btnCell = row.insertCell(3); // Add Drive/Meal/Stay
    
    eatCell.innerHTML = 'Eat';
	atCell.innerHTML = 'At';
    mealCell.innerHTML = '<input type="text" size="48" name="Meal_1_'+rowIndex+'", value="" onChange="setValue(this);return false;">';
	btnCell.innerHTML = '<input type="image" src="icons/delete.png" width="15" width="15" alt="Delete" onclick="delRow(this);return false;"> <input type="image" src="icons/up.png" width="15" width="15" alt="Up" onclick="upRow(this);return false;"> <input type="image" src="icons/down.png" width="15" width="15" alt="down" onclick="downRow(this);return false;">';
}

function addStayRow(r) {
    //var destTbl = document.getElementById(tableId);
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
    var rowIndex = destTbl.rows.length-1;
    
    var row = destTbl.insertRow(rowIndex);
    //var cell1 = row.insertCell(0); // Day X
    var eatCell = row.insertCell(0); // Drive
    var atCell = row.insertCell(1); // From
    var mealCell = row.insertCell(2); // Start to Dest
	var btnCell = row.insertCell(3); // Add Drive/Meal/Stay
    
    eatCell.innerHTML = 'Stay';
	atCell.innerHTML = 'At';
    mealCell.innerHTML = '<input type="text" size="48" name="Stay_1_'+rowIndex+'" value="" onChange="setValue(this);return false;">';
	btnCell.innerHTML = '<input type="image" src="icons/delete.png" width="15" width="15" alt="Delete" onclick="delRow(this);return false;"> <input type="image" src="icons/up.png" width="15" width="15" alt="Up" onclick="upRow(this);return false;"> <input type="image" src="icons/down.png" width="15" width="15" alt="down" onclick="downRow(this);return false;">';
}

function addDoRow(r) {
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
    var rowIndex = destTbl.rows.length-1;
    
    var row = destTbl.insertRow(rowIndex);
    //var cell1 = row.insertCell(0); // Day X
    var eatCell = row.insertCell(0); // Drive
    var atCell = row.insertCell(1); // From
    var doCell = row.insertCell(2); // Start to Dest
	var btnCell = row.insertCell(3); // Add Drive/Meal/Stay
    
    eatCell.innerHTML = 'Do';
	atCell.innerHTML = 'What';
    doCell.innerHTML = '<input type="text" size="15" name="DoW_1_'+rowIndex+'" value="" onChange="setDoWhat(this);return false;"> At <input type="text" size="30" name="DoA_1_'+rowIndex+'" value="" onChange="setDoWhere(this);return false;">';
	btnCell.innerHTML = '<input type="image" src="icons/delete.png" width="15" width="15" alt="Delete" onclick="delRow(this);return false;"> <input type="image" src="icons/up.png" width="15" width="15" alt="Up" onclick="upRow(this);return false;"> <input type="image" src="icons/down.png" width="15" width="15" alt="down" onclick="downRow(this);return false;">';
}

function setDoWhat(r) {
    var doExp = new RegExp("<.*"+r.name+'.*> At');
    var doRep = '<input type="text" size="15" name="'+r.name+'" value="'+r.value+'" onChange="setDoWhat(this);return false;"> At';
    var strReplace = r.parentNode.innerHTML.replace(doExp, doRep);
    r.parentNode.innerHTML = strReplace;
}

function setDoWhere(r) {
    var doExp = new RegExp("At <.*"+r.name+'.*>');
    var doRep = 'At <input type="text" size="30" name="'+r.name+'" value="'+r.value+'" onChange="setDoWhere(this);return false;">';
    var strReplace = r.parentNode.innerHTML.replace(doExp, doRep);
    r.parentNode.innerHTML = strReplace;
}

function setValue(r) {
	var strVal = r.value;
	var strCell = r.parentNode.innerHTML;
	var strReplace = strCell.replace(/value=".*"/, 'value="'+strVal+'"');
	r.parentNode.innerHTML = strReplace;
}


function delRow(r) {
    //var destTbl = document.getElementById(tableId);
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
	var i = r.parentNode.parentNode.rowIndex;	
	destTbl.deleteRow(i);
}

function upRow(r) {
    //var destTbl = document.getElementById(tableId);
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
	var i = r.parentNode.parentNode.rowIndex;
	if(i>1) {
		// insert one row below and transfer contents from row above.
		var row = destTbl.insertRow((i+1));
		var prevRow = destTbl.rows[(i-1)];
		
		for(k=0; k < prevRow.cells.length; k++) {
			var newCell = row.insertCell(k);
			newCell.innerHTML = prevRow.cells[k].innerHTML;
			console.log(prevRow.cells[k].innerHTML);
		}
		
		//delete row above
		destTbl.deleteRow((i-1));
	}
}


function downRow(r) {
//    var destTbl = document.getElementById(tableId);
    var destTbl = r.parentNode.parentNode.parentNode.parentNode;
	var i = r.parentNode.parentNode.rowIndex;
	//alert(r.parentNode.parentNode.parentNode.parentNode.id);
	if(i<(destTbl.rows.length-2)) {
		// insert one row below and transfer contents from row above.
		var row = destTbl.insertRow(i+2);
		var currentRow = destTbl.rows[i];
				
		for(k=0; k < currentRow.cells.length; k++) {
			var newCell = row.insertCell(k);
			newCell.innerHTML = currentRow.cells[k].innerHTML;
		}
		
		//delete row above
		destTbl.deleteRow(i);
	}
}

function downDayRow(r, tableId) {
//    var destTbl = document.getElementById(tableId);
    var destTbl = r.parentNode.parentNode.parentNode.parentNode.parentNode;
	var i = r.parentNode.parentNode.parentNode.rowIndex;
	//alert(r.parentNode.parentNode.parentNode.parentNode.id);
	if(i<(destTbl.rows.length-2)) {
		// insert one row below and transfer contents from row above.
		var row = destTbl.insertRow(i+2);
		var currentRow = destTbl.rows[i];
				
		for(k=0; k < currentRow.cells.length; k++) {
			var newCell = row.insertCell(k);
			newCell.innerHTML = currentRow.cells[k].innerHTML;
		}
		
		//delete row above
		destTbl.deleteRow(i);
        
        //swap row/day IDs
        var dnTbl = document.getElementById("TblDay"+ (i+1));
        var upTbl = document.getElementById("TblDay"+(i+2));
        
        dnTbl.rows[0].cells[0].innerHTML = "Day " + (i+2);
        dnTbl.id = "TblDay" + (i+2);
        
        upTbl.rows[0].cells[0].innerHTML = "Day " + (i+1);
        upTbl.id = "TblDay" + (i+1);
        
        
	}
}

function upDayRow(r, tableId) {
    var destTbl = document.getElementById(tableId);
	var i = r.parentNode.parentNode.parentNode.rowIndex;
    alert(i);

	if(i>0) {
		// insert one row below and transfer contents from row above.
		var row = destTbl.insertRow((i+1));
		var prevRow = destTbl.rows[(i-1)];
		
		for(k=0; k < prevRow.cells.length; k++) {
			var newCell = row.insertCell(k);
			newCell.innerHTML = prevRow.cells[k].innerHTML;
			console.log(prevRow.cells[k].innerHTML);
		}
		
		//delete row above
		destTbl.deleteRow((i-1));
	}
}

function setTripName() {
	var tripName = document.getElementById("TripNameField").value;
	var tripNameTbl = document.getElementById("TripNameTbl");
	var tripNameCell = tripNameTbl.rows[0].cells[1];
	var changeBtnCell = tripNameTbl.rows[0].cells[2];
	tripNameCell.innerHTML = "<h3>"+tripName+"</h3>";
	changeBtnCell.innerHTML = '<input class="tinyfonts" value="Change" type="submit" onclick="changeTripName(\''+tripName+'\')">';
}

function changeTripName(oldTripName) {
	var tripNameTbl = document.getElementById("TripNameTbl");
	var tripNameCell = tripNameTbl.rows[0].cells[1];
	tripNameCell.innerHTML = '<input type="text" id="TripNameField" value="'+ oldTripName +'" onChange="setTripName();">';
	var changeBtnCell = tripNameTbl.rows[0].cells[2];
	changeBtnCell.innerHTML = '&nbsp;';
}

function addDay(tableId) {
    //get hold of the day table
    var allDaysTbl = document.getElementById(tableId);
    //alert(allDaysTbl.id+" : "+allDaysTbl.rows.length);
    //count number of days
    //insert row at the last-1 row
    dayCount = allDaysTbl.rows.length;
    var row = allDaysTbl.insertRow(dayCount-1);
    var cell = row.insertCell(0);
    
    
    
    //create the first day xxx table
    var newDayTblId = "TblDay"+ dayCount;
    cell.innerHTML='<table id="'+ newDayTblId +'"  class="day"></table>'+
                   '<p><input type="image" src="icons/deleteDay.png" width="80" width="200" alt="DeleteDay" onclick="return false;">'+
                   '<input type="image" src="icons/swapDay.png" width="80" width="200" alt="SwapDay" onclick="downDayRow(this, \'TblAllDays\');return false;">';
    
    var newDayTbl = document.getElementById(newDayTblId);
    cell = newDayTbl.insertRow(0).insertCell(0);
    cell.innerHTML = "Day "+ dayCount;
    row = newDayTbl.insertRow(1);
    row.insertCell(0).innerHTML="&nbsp;"; row.insertCell(1).innerHTML="&nbsp;";
    row.insertCell(2).innerHTML = 'Add <input type="image" src="icons/car.png" width="30" width="30" alt="Drive" onclick="addDestTblRow(this); return false;"> &nbsp; <input  type="image" src="icons/meal.png" width="30" width="30" alt="Meal" onclick="addMealRow(this); return false;"> &nbsp; <input type="image" src="icons/bed.png" width="30" width="30" alt="Stay" onclick="addStayRow(this); return false;"> &nbsp; <input type="image" src="icons/do.png" width="30" width="30" alt="See & Do" onclick="addDoRow(this); return false;">';
	row.insertCell(3).innerHTML = "&nbsp;";
}


// initialization
google.maps.event.addDomListener(window, 'load', initialize);






