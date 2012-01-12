var incr=2;

$j(function() {
	$j("#hex_big").click(function() {
	  incr = incr + 0.1;
	  set_layer(incr);
	});
	$j("#hex_small").click(function() {
	  incr = incr - 0.1;
	  set_layer(incr);
	});
});
	
