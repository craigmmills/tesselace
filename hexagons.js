

jQuery.noConflict();
var $j = jQuery;			

$j(document).ready(function() {
	var map = new L.Map('map');

	var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/22677/256/{z}/{x}/{y}.png',
		cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});

	map.setView(new L.LatLng(0, 0), 3).addLayer(cloudmade);
	
	
	var geojsonLayer = new L.GeoJSON();
	map.addLayer(geojsonLayer);
	
	geojsonLayer.on("featureparse", function (e){
	    if (e.properties && e.properties.style && e.layer.setStyle){
	        // The setStyle method isn't available for Points. More on that below ...
	        e.layer.setStyle(e.properties.style);
	    }
	});
	geojsonLayer.addGeoJSON(test_hex());
		
});

//coordinates of each hexagon
function hexagon (length, x_start, y_start){
	
	var hex=[[length + x_start, y_start],
	[((length/2) + x_start), (length * Math.sqrt(length/2)) + y_start],
	[((-length/2) + x_start), (length * Math.sqrt(length/2)) + y_start],
	[(-length + x_start), y_start],
	[((-length/2) + x_start), (-length * Math.sqrt(length/2)) + y_start],
	[(length/2) + x_start, (-length * Math.sqrt(length/2)) + y_start],
	[length + x_start, y_start]
	]; 
	return hex;

}


//origin is starting coordinates [x,y], length in degs for now, bbox: [xmin, xmax, ymin, ymax]
function generate_multihex (length, bbox){

	var current_pos=[];
  //container to hold the full file
  var geojson;

  //array to hold the features
  var features = [];
  var origin = [bbox[0], bbox[3]]; 
  var up = false; //hack to align the hexagons y location
  	
	current_pos = origin;
	var cur_pos_ar=[];
	
  while (current_pos[0] < bbox[1]){
    while (current_pos[1] > bbox[2]){
			features.push(hexagon(length, current_pos[0], current_pos[1]));
	    current_pos = [current_pos[0], current_pos[1] - (length * 2)]; 
    }

    //shift the hexagon creation to the next column with a shift in the y to nest them
    if (up){
      current_pos = [current_pos[0] + (length*1.5), bbox[3]];
      up = false;
		}
    else{
      current_pos = [current_pos[0] + (length*1.5), bbox[3] + (length * Math.sqrt(length/2))];
      up = true;
    }
  }
    
	
  geojson = { "type": "FeatureCollection",
	  "features": [
	    { 
				"type": "Feature",
	      "geometry": {"type": "MultiPolygon", "coordinates": [features]},
				"properties": {"prop1": 0.0, 
				"style": {
				            "color": "#DA5B38",
				            "weight": 0.1,
				            "opacity": 0.8
				        }}
			}]
	   };
	
	
	
	return geojson;

}




function test_hex(){

	var result=generate_multihex(2.0, [-179,179,-89,89]);
	return result;
	
}





