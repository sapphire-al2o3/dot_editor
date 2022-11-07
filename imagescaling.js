'use strict';

module.exports.scaling = (data, width, height, scale, result) => {
	
	if(scale === 1) {
		return data;
	}
	
	let w = width * scale,
		h = height * scale;

	result = result || Buffer.allocUnsafe(w * h);
	
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

	result = result || Buffer.allocUnsafe(frameWidth * frameHeight);
	
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

module.exports.tiling = (data, width, height, frameWidth, frameHeight, result) => {
	
	if(width >= frameWidth || height >= frameHeight) {
		return data;
	}

	result = result || Buffer.allocUnsafe(frameWidth * frameHeight);

	const offsetX = ((frameWidth - width) / 2 ^ 0) % width - width;
	const offsetY = ((frameHeight - height) / 2 ^ 0) % height - height;

	for(let i = 0; i < frameHeight; i++) {
		let y = (i - offsetY) % height * width,
			u = i * frameWidth;
		for(let j = 0; j < frameWidth; j++) {
			let x = (j - offsetX) % width;
			result[u + j] = data[y + x];
		}
	}
	
	return result;
};

