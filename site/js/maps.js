var map;
var markers = [];

var DEFAULT_MARKER_ICON = "images/aguanossa-marker2.png";
//var SELECTED_MARKER_ICON = "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png";

function initialize() {
	googleMapsInit();
	loadNotifications();
}

function googleMapsInit() {
	var mapOptions = {
			zoom : 13,
			center : new google.maps.LatLng(-7.220, -35.886) //	centro de campina grande
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
	//google.maps.event.addListener(map, 'click', function(event) {});
}

function loadNotifications() {
	$.ajax({
		url : '/aguanossa-backend/get_notifications',
		success : function(data) {
			var notifications = $.parseJSON(data);
			for (var i = 0; i < notifications.length; i++) {
				var notification = notifications[i];
				if (notification == "") {
					continue;
				}
				processNotification(notification);
			}
			
			$("#notification-counter").text(notifications.length);
		}
	});
}

function processNotification(notification) {
	var lat_lng = notification.split("/");
	var lat = parseFloat(lat_lng[0].trim());
	var lng = parseFloat(lat_lng[1].trim());
	placeMarker(new google.maps.LatLng(lat, lng));
}

function placeMarker(location) {

	var marker = new google.maps.Marker({
		position : location,
		draggable : false,
		map : map,
		animation: google.maps.Animation.DROP,
		//title : "Hello World!"
		reports : []
	});
	
	marker.setIcon(DEFAULT_MARKER_ICON);

	/*google.maps.event.addListener(marker, 'mouseover', function() {
		marker.setIcon(SELECTED_MARKER_ICON);
	});
	google.maps.event.addListener(marker, 'mouseout', function() {
		marker.setIcon(DEFAULT_MARKER_ICON);
	});*/

	return marker;
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