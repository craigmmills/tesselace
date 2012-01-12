require 'sinatra'
require 'json'


get 'hex/:size' do 
  #[xmin, xmax, ymin, ymax]
  
  #convert 
  generate_multihex params[:size].to_f, [-179,179,-89,89]
end

#coordinates of each hexagon
def hexagon length, x_start, y_start
  hex = [[length + x_start, y_start],
        [((length/2) + x_start), (length * Math.sqrt(length/2)) + y_start],
        [((-length/2) + x_start), (length * Math.sqrt(length/2)) + y_start],
        [(-length + x_start), y_start],
        [(-length/2 + x_start), (-length * Math.sqrt(length/2)) + y_start],
        [(length/2) + x_start, (-length * Math.sqrt(length/2)) + y_start],
        [length + x_start, y_start]]

end

#will be used to make a feature collection of individual polygons rather than one feature of multipolygons
def generate_polygons2

  #container to hold the full file
  geojson = {"type" => "FeatureCollection"}

  #array to hold the features
  features = []

  features << {"type" => "Feature",
                         "geometry" => hexagon(2, 1, 1), 
                         "properties" => {"p_id" => 0}}  
  
  geojson["features"] = features
   
end

#origin is starting coordinates [x,y], length in degs for now, bbox: [xmin, xmax, ymin, ymax]
def generate_multihex length, bbox


  #container to hold the full file
  geojson = {"type" => "MultiPolygon"}

  #array to hold the features
  features = []
  
  origin = [bbox[0], bbox[3]]
  current_pos = origin
  
  up = false #hack to align the hexagons y location
  
  while current_pos[0] < bbox[1] 
    while current_pos[1] > bbox[2]
      features << [hexagon(length, current_pos[0], current_pos[1])]
      current_pos = [current_pos[0], current_pos[1] - ((length * Math.sqrt(length / 2)) * 2)]   
    end
    
    #shift the hexagon creation to the next column with a shift in the y to nest them
    if up
      current_pos = [current_pos[0] + length*1.5, bbox[3]]
      up = false
    else
      current_pos = [current_pos[0] + length*1.5, bbox[3] + (length * Math.sqrt(length/2.0))]
      up = true
    end
  end
    
  geojson["coordinates"] = features
  geojson.to_json
  
end





