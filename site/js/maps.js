var map;
var infoWindow;
var markers = [];
var formTemplate = "";
var markerTemplate = "";
var markerCreated;
var markerSelected;

var DEFAULT_MARKER_ICON = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png";
var SELECTED_MARKER_ICON = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png";

function initialize() {
	googleMapsInit();
	autoCompleteInit();
	loadTemplates();
}

function loadTemplates() {
	$.ajax({
		url: "form.html",
		success: function(data) {
			formTemplate = data;
		}
	});	
	$.ajax({
		url: "marker.html",
		success: function(data) {
			markerTemplate = data;
		}
	});	
}

function googleMapsInit() {
	var mapOptions = {
			zoom : 15,
			center : new google.maps.LatLng(-7.220, -35.886)
	//	centro de campina grande
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
	// Info window element 
	infoWindow = new google.maps.InfoWindow();

	google.maps.event.addListener(map, 'click', function(event) {
		if (onMarkerCreation()) {
			removeMarkOnCreation();
		}
		startMarkCreation(event.latLng);
	});
}

function startMarkCreation(location) {
	markerCreated = placeMarker(location);
}

function removeMarkOnCreation() {
	markerCreated.setMap(null);
	markerCreated = undefined;
}

function closeForm() {
	if (typeof markerCreated != "undefined") {
		removeMarkOnCreation();
	} else {
		loadNotifications(markerSelected);
	}
}

function onMarkerCreation() {
	return typeof markerCreated != "undefined";
}

function onMarkerSelection() {
	return typeof markerSelected != "undefined";
}

function finishReport() {
	if (onMarkerCreation()) {
		markerCreated.reports.push({
			'info' : 'foo.'
		});
	}
	
	if (onMarkerSelection()) {
		markerSelected.reports.push({
			'info' : 'foo.'
		});
	}
	
	infoWindow.close();
	
	markers.push(markerCreated);
	markerCreated = undefined;
}

function placeMarker(location) {

	var marker = new google.maps.Marker({
		position : location,
		draggable : true,
		map : map,
		animation: google.maps.Animation.DROP,
		//title : "Hello World!"
		reports : []
	});

	google.maps.event
	.addListener(
			marker,
			'click',
			function() {
				loadNotifications(marker);
				markerSelected = marker;
			});

	google.maps.event.addListener(marker, 'mouseover', function() {
		marker.setIcon(SELECTED_MARKER_ICON);
	});
	google.maps.event.addListener(marker, 'mouseout', function() {
		marker.setIcon(DEFAULT_MARKER_ICON);
	});

	moveToNewLocation(location, function() {
		// open form
		loadFormTemplate(marker);
	});

	return marker;
}

function loadNotifications(marker) {
	var pos = marker.getPosition();
	map.panTo(pos);

	var contentString = markerTemplate;
	
	var reports = marker.reports;
	for (var i = 0; i < reports.length; i++) {
		contentString += "<hr/>Notificações anteriores: "
			+ reports[i].info;
	}
	contentString += "<hr/></div>";

	infoWindow.setContent(contentString);
	infoWindow.setPosition(pos);
	infoWindow.open(map, marker);
}

function loadFormTemplate(marker) {
	infoWindow.setContent(formTemplate);
	infoWindow.setPosition(marker.getPosition());
	infoWindow.open(map, marker);
}

function setAllMap(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

function clearMarkers() {
	setAllMap(null);
}

function deleteMarkers() {
	clearMarkers();
	markers = [];
}

google.maps.event.addDomListener(window, 'load', initialize);

// Search functions
function geolocate() {
	if (navigator.geolocation) {
		navigator.geolocation
		.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(
					position.coords.latitude,
					position.coords.longitude);
			autocomplete
			.setBounds(new google.maps.LatLngBounds(
					geolocation, geolocation));
		});
	}
}

function autoCompleteInit() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocomplete = new google.maps.places.Autocomplete((document
			.getElementById('input-address')), {
		types : [ 'geocode' ],
		componentRestrictions : {
			country : 'br'
		}
	});
}

function goAction() {
	var place = autocomplete.getPlace();

	if (typeof place == "undefined"
		|| typeof place.geometry == "undefined") {
		requestPlacesService();
	} else {
		markerCreated = placeMarker(place.geometry.location);
	}
}

function requestPlacesService() {
	var request = {
			location : map.getCenter(),
			query : $("#input-address").val(),
			radius : '5000'
	};
	var service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(results, status) {
		if (typeof results[0] != "undefined") {

			// verificar se já tem uma marcação no local
			markerCreated = placeMarker(results[0].geometry.location);
		}
	});
}

function moveToNewLocation(location, callback) {
	map.panTo(location);
	setTimeout(function() {
		map.setZoom(17);
		callback();
	}, 500);
}

// Event Handling
document.onkeydown = function(evt) {
	if (typeof evt.keyCode == "undefined")
		return;

	if (evt.keyCode == 13 && $("#input-address").is(":focus")) {
		goAction();
	}
}