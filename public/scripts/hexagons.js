jQuery.noConflict();
var $j = jQuery;
var geojsonLayer = new L.GeoJSON();
var map;

$j(document).ready(function() {
	"use strict";
	map = new L.Map('map', {
	    center: new L.LatLng(51.505, -0.09), 
	    zoom: 11,
			zoomControl: false
	});
	var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/14682/256/{z}/{x}/{y}.png',
		cloudmade = new L.TileLayer(cloudmadeUrl, {
		maxZoom: 18
	});

	map.setView(new L.LatLng(0, 0), 4).addLayer(cloudmade);

	
	map.addLayer(geojsonLayer);

	geojsonLayer.on("featureparse", function(e) {
		if (e.properties && e.properties.style && e.layer.setStyle) {
			// The setStyle method isn't available for Points. More on that below ...
			e.layer.setStyle(e.properties.style);
		}
	});
	geojsonLayer.addGeoJSON(test_hex());
	set_layer(2);
});

//coordinates of each hexagon
function hexagon(length, x_start, y_start) {
	"use strict";
	var hex = [
		[length + x_start, y_start],
		[((length / 2) + x_start), (length * Math.sqrt(length / 2)) + y_start],
		[((-length / 2) + x_start), (length * Math.sqrt(length / 2)) + y_start],
		[(-length + x_start), y_start],
		[((-length / 2) + x_start), (-length * Math.sqrt(length / 2)) + y_start],
		[(length / 2) + x_start, (-length * Math.sqrt(length / 2)) + y_start],
		[length + x_start, y_start]];
	return hex;

}

//origin is starting coordinates [x,y], length in degs for now, bbox: [xmin, xmax, ymin, ymax]
function generate_multihex(length, bbox) {
	"use strict";
	var current_pos = [];
	//container to hold the full file
	var geojson;

	//array to hold the features
	var features = [];
	var origin = [bbox[0], bbox[3]];
	var up = false; //hack to align the hexagons y location
	current_pos = origin;
	var cur_pos_ar = [];

	while (current_pos[0] < bbox[1]) {
		while (current_pos[1] > bbox[2]) {
			features.push(hexagon(length, current_pos[0], current_pos[1]));
			current_pos = [current_pos[0], current_pos[1] - ((length * Math.sqrt(length / 2)) * 2)];
		}

		//shift the hexagon creation to the next column with a shift in the y to nest them
		if (up) {
			current_pos = [current_pos[0] + (length * 1.5), bbox[3]];
			up = false;
		} else {
			current_pos = [current_pos[0] + (length * 1.5), bbox[3] + (length * Math.sqrt(length / 2))];
			up = true;
		}
	}

	geojson = {
		"type": "FeatureCollection",
		"features": [{
			"type": "Feature",
			"geometry": {
				"type": "MultiPolygon",
				"coordinates": [features]
			},
			"properties": {
				"prop1": 0.0,
				"style": {
					"color": "#CA432D",
					"weight": 1,
					"opacity": 0.9,
					"fillOpacity": 0.4,
					"fillColor": "#F8EED3"
				}
			}
		}]
	};

	return geojson;
//F8EED3  78ADA4  CA432D
}

function test_hex() {
	"use strict";
	var result = generate_multihex(2, [-179.0, 179.0, -89.0, 89.0]);
	return result;
}

function set_layer(length){	
	geojsonLayer.clearLayers();
	geojsonLayer.addGeoJSON(generate_multihex(length, [-179.0, 179.0, -89.0, 89.0]));
	var hn = window.location.hostname;
	georef = "http://" + hn + "/hex/" + length;	
	$j("#geolink").html("<a href='" + georef + "'>geojson</p>");
}
