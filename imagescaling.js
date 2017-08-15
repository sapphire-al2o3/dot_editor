'use strict';

module.exports.scaling = function(data, width, height, scale, result) {
	
	if(scale === 1) {
		return data;
	}
	
	let w = width * scale,
		h = height * scale;

	result = result || new Buffer(w * h);
	
	for(let i = 0; i < h; i++) {
		let y = i / scale ^ 0;
		for(let j = 0; j < w; j++) {
			let x = j / scale ^ 0;
			result[i * w + j] = data[y * width + x];
		}
	}
	
	return result;
};

