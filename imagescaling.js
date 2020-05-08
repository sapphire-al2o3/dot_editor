'use strict';

module.exports.scaling = (data, width, height, scale, result) => {
	
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

module.exports.frame = (data, width, height, frameWidth, frameHeight, result) => {
	
	if(width >= frameWidth || height >= frameHeight) {
		return data;
	}

	result = result || new Buffer(frameWidth * frameHeight);
	
	for(let i = 0; i < frameWidth * frameHeight; i++) {
		result[i] = 0;
	}

	const offsetX = (frameWidth - width) / 2 ^ 0;
	const offsetY = (frameHeight - height) / 2 ^ 0;

	for(let i = 0; i < height; i++) {
		let y = i,
			u = i + offsetY;
		for(let j = 0; j < width; j++) {
			let x = j,
				v = j + offsetX;
			result[u * frameWidth + v] = data[y * width + x];
		}
	}
	
	return result;
};

