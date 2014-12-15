var map;
var markers = [];

var DEFAULT_MARKER_ICON = "images/aguanossa-marker.png";
var UPDATE_INTERVAL = 300000;

function initialize() {
	googleMapsInit();
	loadNotifications();
	
	setInterval(loadNotifications, UPDATE_INTERVAL);
}

function googleMapsInit() {
	var mapOptions = {
			zoom : 13,
			center : new google.maps.LatLng(-7.220, -35.886) //	centro de campina grande
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
}

function loadNotifications() {
	$.ajax({
		url : '/aguanossa-backend/get_notifications',
		success : function(data) {
			deleteMarkers();
			var notifications = $.parseJSON(data);
			var count_notifications = 0;
			for (var i = 0; i < notifications.length; i++) {
				var notification = notifications[i];
				if (notification == "") {
					continue;
				}
				processNotification(notification);
				count_notifications++;
			}
			
			$("#notification-counter").text(count_notifications);
		}
	});
}

function processNotification(notification) {
	var lat_lng = notification.split("/");
	var lat = parseFloat(lat_lng[0].trim());
	var lng = parseFloat(lat_lng[1].trim());
	placeMarker(new google.maps.LatLng(lat, lng));
	markers.push(placeMarker(new google.maps.LatLng(lat, lng)));
}

function placeMarker(location) {
	var marker = new google.maps.Marker({
		position : location,
		draggable : false,
		map : map,
		animation: google.maps.Animation.DROP,
		icon : DEFAULT_MARKER_ICON,
		//title : "Hello World!"
		reports : []
	});
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