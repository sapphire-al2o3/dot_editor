'use strict';

module.exports.scaling = function(data, width, height, scale, result) {
	
	if(scale === 1) {
		return data;
	}
	
	var w = width * scale,
		h = height * scale;

	result = result || new Buffer(w * h);
	
	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			var x = j / scale ^ 0,
				y = i / scale ^ 0;
			result[i * w + j] = data[y * width + x];
		}
	}
	
	return result;
};
        
