/*
 * require('canvas.js')
 */
(function(global) {
	'use strict';
	
	function checkChunk(buffer, offset, chunk) {
		for(let i = 0; i < chunk.length; i++) {
			if(chunk[i].charCodeAt() !== buffer[offset + i]) {
				return false;
			}
		}
		return true;
	}
	
	// PNG画像からパレットを取得する
	function getPngPalette(buffer, paletteData) {
		// PNGか判定
		let png =
			buffer[0] === 0x89 &&
			buffer[1] === 0x50 &&
			buffer[2] === 0x4e &&
			buffer[3] === 0x47 &&
			buffer[4] === 0x0d &&
			buffer[5] === 0x0a &&
			buffer[6] === 0x1a &&
			buffer[7] === 0x0a;
		
		if(!png) return false;
		
		let c = 8,
			data = paletteData.data;
		
		// パレット形式か判定
		
		// PLTEチャンクを探す
		while(c < buffer.length) {
			
			if(checkChunk(buffer, c, 'PLTE')) {
				let size = buffer[c - 1] | buffer[c - 2] << 8 | buffer[c - 3] << 16 || buffer[c - 4] << 24;
				c += 4;
				for(let i = 0, j = 0; i < size; i += 3, j += 4) {
					data[j + 0] = buffer[c + i];
					data[j + 1] = buffer[c + i + 1];
					data[j + 2] = buffer[c + i + 2];
					data[j + 3] = 255;
				}
				
				paletteData.count = size / 3;
				
				c += size + 4;
				
				if(checkChunk(buffer, c + 4, 'tRNS')) {
					// 透明度
					size = buffer[c] << 24 | buffer[c + 1] << 16 | buffer[c + 2] << 8 | buffer[c + 3];
					console.log('tRNS', size);
					
					c += 8;
					
					for(let i = 0, j = 0; i < size; i++, j += 4) {
						data[j + 3] = buffer[c + i];
						buffer[c + i] = 255;
					}
				}
				
				return true;
			}
			c++;
		}
		
		return false;
	}
	
	const FileLoader = {
		target: null,
		onload: function() {},
		load: function(file) {
			let reader = new FileReader(),
				image = new Image(),
				that = this;
			
			reader.onload = function(e) {
				let result = reader.result.split(',');
				let str = result[1];
				let buffer = Base64.decode(str);
				let paletteData = createPaletteData(256);
				let hasPalette = false;
				let backIndex = -1;
				
				if(getPngPalette(buffer, paletteData)) {
					hasPalette = true;
					for(let i = 0; i < paletteData.data.length; i += 4) {
						if(paletteData.data[i + 3] === 0) {
							backIndex = i / 4;
							break;
						}
					}
				}
				
				image.onload = () => {
				
					// canvasから画像読み込み
					let canvas = document.createElement('canvas'),
						ctx = canvas.getContext('2d'),
						indexData = createIndexData(image.width, image.height);
					
					canvas.width = image.width;
					canvas.height = image.height;
					ctx.globalCompositeOperation = 'copy';
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(image, 0, 0);
					if(hasPalette) {
						convertIndexedImageByPalette(ctx.getImageData(0, 0, image.width, image.height), indexData, paletteData, backIndex);
					} else {
						convertIndexedImage(ctx.getImageData(0, 0, image.width, image.height), indexData, paletteData);
					}
					if(that.onload) that.onload(indexData, paletteData);
				};
				image.src = result[0] + ',' + Base64.encode(buffer);
				console.log('image loaded');
			};
			reader.readAsDataURL(file);
		},
		dropHandler: function(e) {
			e.preventDefault();
			if(e.dataTransfer.files.length > 0) {
				this.load(e.dataTransfer.files[0]);
			}
			return false;
		},
		dragHandler: function(e) {
			e.preventDefault();
			return false;
		},
		bind: function(target) {
			this.target = target;
			target.addEventListener('drop', this.dropHandler.bind(this), false);
			target.addEventListener('dragover', this.dragHandler, false);
		},
		unbind: function() {
			this.target.removeEventListener('drop', this.dropHandler, false);
			this.target.removeEventListener('dragover', this.dropHandler, false);
		}
	};
	
	global.FileLoader = FileLoader;
	
})(this);
