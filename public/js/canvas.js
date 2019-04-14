/*
 * canvas helper
 */

'use strict';

// キャンバスとインデックスデータを消去する
function clear(ctx, indexData) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	if(indexData) {
		let data = indexData.data;
		for(let i = 0, n = data.length; i < n; i++) {
			data[i] = 0;
		}
	}
}

// 破線の描画
function strokeDashLine(ctx, x0, y0, x1, y1, s) {
	'use strict';
	let dx = x1 - x0,
		dy = y1 - y0,
		l = Math.sqrt(dx * dx + dy * dy),
		d = l / s ^ 0;
	ctx.beginPath();
	ctx.moveTo(x0 - 0.5, y0 - 0.5);
	for(let i = 1; i <= d; i += 2) {
		let sx = x0 + dx * (i - 1) / d - 0.5,
			sy = y0 + dy * (i - 1) / d - 0.5,
			ex = x0 + dx * i / d - 0.5,
			ey = y0 + dy * i / d - 0.5;
		ctx.moveTo(sx, sy);
		ctx.lineTo(ex, ey);
	}
	ctx.strokeStyle = '#000000';
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(x0 - 0.5, y0 - 0.5);
	for(let i = 0; i <= d; i += 2) {
		let sx = x0 + dx * (i - 1) / d - 0.5,
			sy = y0 + dy * (i - 1) / d - 0.5,
			ex = x0 + dx * i / d - 0.5,
			ey = y0 + dy * i / d - 0.5;
		ctx.moveTo(sx, sy);
		ctx.lineTo(ex, ey);
	}
	ctx.strokeStyle = '#FFFFFF';
	ctx.stroke();
	
	/*
	ctx.beginPath();
	ctx.arc(x0, y0, 2.0, 0, Math.PI * 2, true);
	ctx.arc(x1, y1, 2.0, 0, Math.PI * 2, true);
	ctx.fill();
	*/
}

// 選択範囲の表示
function drawSelectionRegion(ctx, x0, y0, x1, y1, scale) {
	let s = scale;
	ctx.strokeStyle = '#000000';
	strokeDashLine(ctx, x0 * s, y0 * s, x1 * s, y0 * s, 3);
	strokeDashLine(ctx, x0 * s, y1 * s, x1 * s, y1 * s, 3);
	strokeDashLine(ctx, x0 * s, y0 * s, x0 * s, y1 * s, 3);
	strokeDashLine(ctx, x1 * s, y0 * s, x1 * s, y1 * s, 3);
}

// ドットの表示
function drawDot(ctx, x, y, indexData, paletteIndex, scale) {
	let s = scale;
	ctx.fillRect(x * s, y * s, s, s);
	if(indexData) indexData.data[y * indexData.width + x] = paletteIndex;
}

// 直線の表示
function drawLine(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
	let dx = Math.abs(x1 - x0),
		dy = Math.abs(y1 - y0),
		dx2 = dx * 2,
		dy2 = dy * 2,
		sx = x1 > x0 ? 1 : -1,
		sy = y1 > y0 ? 1 : -1,
		x = x0,
		y = y0,
		data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		s = scale;
	ctx.beginPath();
	if(dx >= dy) {
		let e = -dx;
		for(let i = 0; i <= dx; i++) {
			if(x < 0 || x >= w || y < 0 || y >= h) {
				break;
			}
			ctx.rect(x * s ^ 0, y * s ^ 0, s, s);
			if(data) {
				data[y * w + x] = paletteIndex;
			}
			x += sx;
			e += dy2;
			if(e >= 0) {
				y += sy;
				e -= dx2;
			}
		}
	} else {
		let e = -dy;
		for(let i = 0; i <= dy; i++) {
			if(x < 0 || x >= w || y < 0 || y >= h) {
				break;
			}
			ctx.rect(x * s ^ 0, y * s ^ 0, s, s);
			if(data) {
				data[y * w + x] = paletteIndex;
			}
			y += sy;
			e += dx2;
			if(e >= 0) {
				x += sx;
				e -= dy2;
			}
		}
	}
	ctx.fill();
}

// 矩形
function drawRect(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
	let left = Math.min(x0, x1),
		right = Math.max(x0, x1),
		top = Math.min(y0, y1),
		bottom = Math.max(y0, y1),
		s = scale,
		data = indexData ? indexData.data : null,
		w = indexData ? indexData.width : 0,
		h = indexData ? indexData.height : 0;
	
	ctx.beginPath();
	for(let i = top; i <= bottom; i++) {
		let y = i * s;
		ctx.rect(left * s, y, s, s);
		ctx.rect(right * s, y, s, s);
		if(data) {
			if(0 <= i && i < h) {
				if(left >= 0) {
					data[i * w + left] = paletteIndex;
				}
				if(right < w) {
					data[i * w + right] = paletteIndex;
				}
			}
		}
	}
	for(let j = left + 1; j < right; j++) {
		let x = j * s;
		ctx.rect(x, top * s, s, s);
		ctx.rect(x, bottom * s, s, s);
		if(data) {
			if(0 <= j && j < w) {
				data[top * w + j] = paletteIndex;
				data[bottom * w + j] = paletteIndex;
			}
		}
	}
	ctx.fill();
}

// 塗りつぶし矩形
function fillRect(ctx, x0, y0, x1, y1, indexData, index, scale) {
	let left = Math.min(x0, x1),
		right = Math.max(x0, x1),
		top = Math.min(y0, y1),
		bottom = Math.max(y0, y1),
		s = scale,
		data = indexData.data,
		w = indexData.width;
	
	if(left < 0) left = 0;
	if(right >= w) right = w - 1;
	if(top < 0) top = 0;
	if(bottom >= w) bottom = w - 1;
	
	if(data) {
		for(let i = top; i<= bottom; i++) {
			let y = i * w;
			for(let j = left; j <= right; j++) {
				data[y + j] = index;
			}
		}
	}
	ctx.fillRect(left * s, top * s, (right - left + 1) * s, (bottom - top + 1) * s);
}

// 塗りつぶし
function paint(ctx, x, y, indexData, paletteIndex, scale) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		c = data[y * w + x],
		s = scale;
	
	if(c == paletteIndex) {
		return;
	}
	
	ctx.beginPath();
	(function f(x, y) {
		if(x >= w || x < 0) return;
		if(y >= h || y < 0) return;
		if(data[y * w + x] === c) {
			data[y * w + x] = paletteIndex;
			ctx.rect(x * s ^ 0, y * s ^ 0, s, s);
			f(x - 1, y);
			f(x + 1, y);
			f(x, y - 1);
			f(x, y + 1);
		}
	})(x, y);
	ctx.fill();
}

// アウトライン描画
function drawOutline(ctx, x, y, indexData, paletteIndex, scale) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		c = data[y * w + x],
		s = scale,
		tmpIndexData = createIndexData(w, h),
		tmp = tmpIndexData.data;
	
	if(c == paletteIndex) {
		return;
	}
	
	(function f(x, y) {
		if(x >= w || x < 0) return;
		if(y >= h || y < 0) return;
		if(data[y * w + x] === c && tmp[y * w + x] === 0) {
			tmp[y * w + x] = 1;
			
			f(x - 1, y);
			f(x + 1, y);
			f(x, y - 1);
			f(x, y + 1);
		}
	})(x, y);
	
	ctx.beginPath();
	
	// 縮退させる
	for(let i = 0; i < h; i++) {
		for(let j = 0; j < w; j++) {
			let k = i * w + j,
				p = tmp[k] === 1;
			
			
			if(p) {
				let b = false;
				if(i > 0) b |= tmp[k - w] === 0;
				if(i < h - 1) b |= tmp[k + w] === 0;
				if(j > 0) b |= tmp[k - 1] === 0;
				if(j < w - 1) b |= tmp[k + 1] === 0;
				if(b) {
					data[i * w + j] = paletteIndex;
					ctx.rect(j * s ^ 0, i * s ^ 0, s, s);
				}
			}
		}
	}
	
	ctx.fill();
}

function eps(x0, y0, x1, y1, x, y) {
	let dx = (x1 - x0),
		dy = (y1 - y0),
		dx2 = dx * dx,
		dy2 = dy * dy,
		ex = 2 * x - x0 - x1,
		ey = 2 * y - y0 - y1,
		e = dx2 * dy2 - dy * dy * ex * ex - dx * dx * ey * ey;
	//console.log(e);
	return e;
}

function setPixel(data, x, y, w, h, value) {
	if(data && x >= 0 && x < w && y >= 0 && y < h) {
		data[y * w + x] = value;
	}
}

// 円を描画する
function drawEllipse(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
	let left = Math.min(x0, x1),
		right = Math.max(x0, x1),
		top = Math.min(y0, y1),
		bottom = Math.max(y0, y1),
		data = indexData ? indexData.data : null;
	
	x0 = left;
	x1 = right;
	y0 = top;
	y1 = bottom;
	
	let dx = x1 - x0,
		dy = y1 - y0,
		dx2 = dx * dx,
		dy2 = dy * dy,
		a = dx >> 1,
		b = dy >> 1,
		w = scale,
		h = scale,
		iw = indexData.width,
		ih = indexData.height;
		
	//console.log(x0, y0, x1, y1, w, h);
	ctx.beginPath();
	let x = ((x0 + x1) >> 1) * w;
	ctx.rect(x, y0 * h, w, h);
	ctx.rect(x, y1 * h, w, h);
//	if(data) {
//		data[y0 * iw + ((x0 + x1) >> 1)] = paletteIndex;
//		data[y1 * iw + ((x0 + x1) >> 1)] = paletteIndex;
//	}
	setPixel(data, (x0 + x1) >> 1, y0, iw, ih, paletteIndex);
	setPixel(data, (x0 + x1) >> 1, y1, iw, ih, paletteIndex);

	if((dx & 1)) {
		ctx.rect(x + w, y0 * h, w, h);
		ctx.rect(x + w, y1 * h, w, h);
//		if(data) {
//			data[y0 * iw + ((x0 + x1) >> 1) + 1] = paletteIndex;
//			data[y1 * iw + ((x0 + x1) >> 1) + 1] = paletteIndex;
//		}
		setPixel(data, ((x0 + x1) >> 1) + 1, y0, iw, ih, paletteIndex);
		setPixel(data, ((x0 + x1) >> 1) + 1, y1, iw, ih, paletteIndex);
	}
	
	let y = ((y0 + y1) >> 1) * h;
	ctx.rect(x0 * w, y, w, h);
	ctx.rect(x1 * w, y, w, h);
//	if(data) {
//		data[((y0 + y1) >> 1)  * iw + x0] = paletteIndex;
//		data[((y0 + y1) >> 1)  * iw + x1] = paletteIndex;
//	}
	setPixel(data, x0, (y0 + y1) >> 1, iw, ih, paletteIndex);
	setPixel(data, x1, (y0 + y1) >> 1, iw, ih, paletteIndex);
	if((dy & 1)) {
		ctx.rect(x0 * w, y + h, w, h);
		ctx.rect(x1 * w, y + h, w, h);
//		if(data) {
//			data[(((y0 + y1) >> 1)  + 1) * iw + x0] = paletteIndex;
//			data[(((y0 + y1) >> 1)  + 1) * iw + x1] = paletteIndex;
//		}
		setPixel(data, x0, ((y0 + y1) >> 1)  + 1, iw, ih, paletteIndex);
		setPixel(data, x1, ((y0 + y1) >> 1)  + 1, iw, ih, paletteIndex);
	}
	
	let a2 = a * a,
		b2 = b * b,
		f = b2 *(-2 * a + 1) + 2 * a2,
		o = x * b2 / a2,
		cx = x0 + a,
		cy = y0 + b,
		cx1 = x1 - a,
		cy1 = y1 - b,
		n = a / Math.sqrt(b2 /a2 + 1) - 0.5;
	
	y = y1;
	x = ((x0 + x1) >> 1);
	for(let i = 0; i < n; i++) {
		let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y + 0.5),
			e1 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y - 1 + 0.5);
		
		if(Math.abs(e0) < Math.abs(e1)) {
			x = x - 1;
		} else {
			x = x - 1;
			y = y - 1;
		}
		ctx.rect(x * w, y * h, w, h);
		ctx.rect((x1 - x + x0) * w, y * h, w, h);
		ctx.rect(x * w, (y1 - y + y0) * h, w, h);
		ctx.rect((x1 - x + x0) * w, (y1 - y + y0) * h, w, h);
		if(data) {
//			data[y * iw + x] = paletteIndex;
//			data[y * iw + x1 - x + x0] = paletteIndex;
//			data[(y1 - y + y0) * iw + x] = paletteIndex;
//			data[(y1 - y + y0) * iw + x1 - x + x0] = paletteIndex;

			setPixel(data, x, y, iw, ih, paletteIndex);
			setPixel(data, x1 - x + x0, y, iw, ih, paletteIndex);
			setPixel(data, x, y1 - y + y0, iw, ih, paletteIndex);
			setPixel(data, x1 - x + x0, y1 - y + y0, iw, ih, paletteIndex);
		}
	}
	if(y - 1 <= cy) {
		ctx.fill();
		return;
	}
	
	y = (y0 + y1) >> 1;
	x = x1;
	n = b / Math.sqrt(a2 / b2 + 1);
	for(let i = 0; i < n; i++) {
		let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x + 0.5, y - 1 + 0.5),
			e1 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y - 1 + 0.5);
		if(Math.abs(e0) < Math.abs(e1)) {
			y = y - 1;
		} else {
			x = x - 1;
			y = y - 1;
		}
		ctx.rect(x * w, y * h, w, h);
		ctx.rect((x1 - x + x0) * w, y * h, w, h);
		ctx.rect(x * w, (y1 - y + y0) * h, w, h);
		ctx.rect((x1 - x + x0) * w, (y1 - y + y0) * h, w, h);
		if(data) {
//            if(y >= 0 && y < ih) {
//                if(x >= 0 && x < iw) data[y * iw + x] = paletteIndex;
//                if(x1 - x + x0 >= 0 && x1 - x + x0 < iw) data[y * iw + x1 - x + x0] = paletteIndex;
//            }
			setPixel(data, x, y, iw, ih, paletteIndex);
			setPixel(data, x1 - x + x0, y, iw, ih, paletteIndex);
			setPixel(data, x, y1 - y + y0, iw, ih, paletteIndex);
			setPixel(data, x1 - x + x0, y1 - y + y0, iw, ih, paletteIndex);

//            if(y1 - y + y0 >= 0 && y1 - y + y0 < ih) {
//                if(x >= 0 && x < iw) data[(y1 - y + y0) * iw + x] = paletteIndex;
//                data[(y1 - y + y0) * iw + x1 - x + x0] = paletteIndex;
//            }
		}
	}

	ctx.fill();
}

// 塗りつぶし円を描画する
function fillEllipse(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale) {
	let left = Math.min(x0, x1),
		right = Math.max(x0, x1),
		top = Math.min(y0, y1),
		bottom = Math.max(y0, y1),
		data = indexData.data;
	
	x0 = left;
	x1 = right;
	y0 = top;
	y1 = bottom;
	
	let dx = x1 - x0,
		dy = y1 - y0,
		dx2 = dx * dx,
		dy2 = dy * dy,
		a = dx >> 1,
		b = dy >> 1,
		s = scale,
		iw = data ? indexData.width : 0,
		ih = data ? indexData.height : 0;
		
	ctx.beginPath();
	let x = ((x0 + x1) >> 1) * s;
	ctx.rect(x, y0 * s, s, s);
	ctx.rect(x, y1 * s, s, s);
	if(data) {
		let ix = (x0 + x1) >> 1;
		if(0 <= ix && ix < iw) {
			if(0 <= y0 && y0 < ih) data[y0 * iw + ix] = paletteIndex;
			if(0 <= y0 && y0 < ih) data[y1 * iw + ix] = paletteIndex;
		}
	}
	if((dx & 1)) {
		ctx.rect(x + s, y0 * s, s, s);
		ctx.rect(x + s, y1 * s, s, s);
		if(data) {
			let ix = ((x0 + x1) >> 1) + 1;
			if(0 <= ix && ix < iw) {
				if(0 <= y0 && y0 < ih) data[y0 * iw + ix] = paletteIndex;
				if(0 <= y1 && y1 < ih) data[y1 * iw + ix] = paletteIndex;
			}
		}
	}
	
	let y = ((y0 + y1) >> 1) * s;
	
	ctx.rect(x0 * s, y, (x1 - x0 + 1) * s, s);
	
	if(data) {
		let iy = ((y0 + y1) >> 1) * iw;
		if(0 <= iy && iy < ih * iw) {
			for(let j = x0; j <= x1; j++) {
				if(0 <= j && j < iw) {
					data[iy + j] = paletteIndex;
				}
			}
		}
	}
	if((dy & 1)) {
		ctx.rect(x0 * s, y + s, (x1 - x0 + 1) * s, s);
		
		if(data) {
			let iy = (((y0 + y1) >> 1) + 1) * iw;
			if(0 <= iy && iy < ih * iw) {
				for(let j = x0; j <= x1; j++) {
					if(0 <= j && j < iw) {
						data[iy + j] = paletteIndex;
					}
				}
			}
		}
	}
	
	let a2 = a * a,
		b2 = b * b,
		f = b2 *(-2 * a + 1) + 2 * a2,
		cx = x0 + a,
		cy = y0 + b,
		n = a / Math.sqrt(b2 / a2 + 1) - 0.5;
	
//	console.log(n);
	
	y = y1;
	x = ((x0 + x1) >> 1);
	for(let i = 0; i < n; i++) {
		let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y + 0.5),
			e1 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y - 1 + 0.5);
		
		if(Math.abs(e0) < Math.abs(e1)) {
			x = x - 1;
		} else {
			x = x - 1;
			y = y - 1;
		}
		ctx.rect(x * s, y * s, (x1 + x0 - x * 2 + 1) * s, s);
		ctx.rect(x * s, (y1 - y + y0) * s, (x1 + x0 - x * 2 + 1) * s, s);
		
		if(data) {
			for(let j = x; j <= x1 - x + x0; j++) {
				if(0 <= j && j < iw) {
					data[y * iw + j] = paletteIndex;
					data[(y1 - y + y0) * iw + j] = paletteIndex;
				}
			}
		}
	}
	if(y - 1 <= cy) {
		ctx.fill();
		return;
	}
	
	y = (y0 + y1) >> 1;
	x = x1;
	n = b / Math.sqrt(a2 / b2 + 1);
	for(let i = 0; i < n; i++) {
		let e0 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x + 0.5, y - 1 + 0.5),
			e1 = eps(x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, x - 1 + 0.5, y - 1 + 0.5);
		if(Math.abs(e0) < Math.abs(e1)) {
			y = y - 1;
		} else {
			x = x - 1;
			y = y - 1;
		}
		
		ctx.rect((x1 - x + x0) * s, y * s, (x * 2 - x1 - x0  + 1) * s, s);
		ctx.rect((x1 - x + x0) * s, (y1 - y + y0) * s, (x * 2 - x1 - x0  + 1) * s, s);
		
		if(data) {
			for(let j = x1 - x + x0; j <= x; j++) {
				if(0 <= j && j < iw) {
					data[y * iw + j] = paletteIndex;
					data[(y1 - y + y0) * iw + j] = paletteIndex;
				}
			}
		}
	}

	ctx.fill();
}

// グリッドを表示する
function drawGrid(ctx, option, scale) {
	let size = scale,
		l = option.grid.size,
		n = option.imageWidth,
		w = ctx.canvas.width,
		h = ctx.canvas.height;
	ctx.strokeStyle = option.grid.color1;
	ctx.lineWidth = 1.0;
	ctx.beginPath();
	for(let i = 1; i < n; i++) {
		let x = size * i - 0.5;
		ctx.moveTo(0.5, x);
		ctx.lineTo(w + 0.5, x);
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h + 0.5);
	}
	ctx.stroke();
	ctx.strokeStyle = option.grid.color0;
	ctx.beginPath();
	for(let i = l; i < n; i += l) {
		let x = size * i - 0.5;
		ctx.moveTo(0.5, x);
		ctx.lineTo(w + 0.5, x);
		ctx.moveTo(x, 0.5);
		ctx.lineTo(x, h + 0.5);
	}
	ctx.stroke();
}

/////////////////////////////////////////////////////
// indexed image
/////////////////////////////////////////////////////

// インデックスカラーイメージを描画する
function drawIndexedImage(ctx, image, palette, scale, paletteData, transparent) {
	let data = image.data,
		size = scale,
		w = image.width,
		h = image.height,
		l = w * h,
		total = 0;
	/*
	for(let k = 0, n = palette.length; k < n; k++) {
		let count = 0,
			index = 0;
		ctx.beginPath();
		
		for(let i = 0; i < h && count < l; i++) {
			let y = i * size,
				f = false,
				len = 0,
				x = 0;
			for(let j = 0; j < w; j++) {
				if(data[index] === k) {
					if(len === 0) {
						x = j;
					}
					count++;
					len++;
				} else {
					if(len) {
						ctx.rect(x * size, y, size * len, size);
						len = 0;
					}
				}
				index++;
			}
			if(len) {
				ctx.rect(x * size, y, size * len, size);
			}
		}
		if(count > 0) {
			ctx.fillStyle = palette[k];
			ctx.fill();
			total += count;
			if(total === l) {
				break;
			}
		}
	}
	*/
	
//	for(let k = 0, n = palette.length; k < n; k++) {
//		ctx.fillStyle = palette[k];
//		for(let i = 0; i < h; i++) {
//			for(let j = 0; j < w; j++) {
//				if(data[i * w + j] === k) {
//					ctx.fillRect(j * size, i * size, size, size);
//				}
//			}
//		}
//	}
	
	let dw = w * size,
		dh = h * size,
		dst = ctx.createImageData(dw, dh),
		dstData = dst.data,
		u32image = new Uint32Array(dst.data.buffer),
		u32palette = new Uint32Array(paletteData.data.buffer),
		k = 0,
		p = paletteData.data;
	for(let i = 0; i < dh; i++) {
		let y = (i / size ^ 0) * w;
		for(let j = 0; j < dw; j++) {
//			let x = j / size ^ 0,
//				index = data[y + x] * 4;
//			if(index !== transparent) {
//				dstData[k] = p[index];
//				dstData[k + 1] = p[index + 1];
//				dstData[k + 2] = p[index + 2];
//				dstData[k + 3] = 255;
//			}
//			k += 4;
			
			let x = j / size ^ 0,
				index = data[y + x];
			if(index !== transparent) {
				u32image[k] = u32palette[index];
			}
			k++;
		}
	}
	ctx.putImageData(dst, 0, 0);
	
}

function drawIndexedImageData(ctx, image, palette, scale, transparent) {
	let index = 0,
		data = image.data,
		paletteData = palette.data,
		dest = ctx.createImageData(image.width * scale, image.height * scale),
		w = dest.width,
		h = dest.height,
		stride = image.width,
		destData = dest.data,
		t = transparent === undefined ? 256 : transparent;
	for(let i = 0, p = 0; i < h; i++) {
		let y = i / scale ^ 0;
		for(let j = 0; j < w; j++) {
			let x = j / scale ^ 0;
			index = y * stride + x;
			let pindex = data[index] * 4;
			destData[p] = paletteData[pindex];
			destData[p + 1] = paletteData[pindex + 1];
			destData[p + 2] = paletteData[pindex + 2];
			destData[p + 3] = t === data[index] ? 0 : 255;
			p += 4;
		}
	}
	ctx.putImageData(dest, 0, 0);
}

// 拡大して表示する
function drawImage(ctx, image, dx, dy, dw, dh) {
	
	let index = 0,
		data = image.data,
		c = '#000',
		scale = 8;
	dw = image.width;
	dh = image.height;
	
	//ctx.beginPath();
	let cx = ctx;
	for(let i = 0; i < dh; i++) {
		let y = i * scale;
		for(let j = 0; j < dw; j++) {
			let x = j * scale,
				color = rgb(data[index], data[index + 1], data[index + 2]);
			
			if(color !== c) {
				cx.fillStyle = color;
			}
			
			cx.fillRect(x, y, scale, scale);
			index += 4;
		}
	}
}

// 水平方向反転
function flipH(ctx, indexData) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height;
	
//	ctx.setTransform(-1, 0, 0, 1, ctx.canvas.width, 0);
//	ctx.drawImage(ctx.canvas, 0, 0);
//	ctx.resetTransform();
	
	flipImageH(data, w, h);
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	flipImageH(new Uint32Array(imageData.data.buffer), imageData.width, imageData.height);
	
	ctx.putImageData(imageData, 0, 0);
}

function flipImageH(data, w, h) {
	for(let i = 0; i < h; i++) {
		let y = i * w;
		for(let j = 0; j < (w / 2 ^ 0); j++) {
			let tmp = data[y + j];
			data[y + j] = data[y + w - j - 1];
			data[y + w - j - 1] = tmp;
		}
	}
}

function copyFlipImageH(src, dst, w, h) {
	for(let i = 0; i < h; i++) {
		let y = i * w;
		for(let j = 0; j < w; j++) {
			data[y + w - j - 1] = src[y + j];
		}
	}
}

// 垂直方向反転
function flipV(ctx, indexData) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height;
	
	// 透明部分が上書きされてしまう
//	ctx.setTransform(1, 0, 0, -1, 0, ctx.canvas.height);
//	ctx.drawImage(ctx.canvas, 0, 0);
//	ctx.resetTransform();
	
	flipImageV(data, w, h);
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	flipImageV(new Uint32Array(imageData.data.buffer), imageData.width, imageData.height);
	
	ctx.putImageData(imageData, 0, 0);
}

function flipImageV(data, w, h) {
	for(let i = 0; i < (h / 2 ^ 0); i++) {
		let y = i * w,
			x = (h - i - 1) * w;
		for(let j = 0; j < w; j++) {
			let tmp = data[y + j];
			data[y + j] = data[x + j];
			data[x + j] = tmp; 
		}
	}
}

// 右90度回転
function rotate90R(ctx, indexData) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height;
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
		buffer = new Uint32Array(imageData.data.buffer);
	
	if(w === h) {
		mirrorImageXY(data, w, h);
		flipImageH(data, w, h);
		
		mirrorImageXY(buffer, imageData.width, imageData.height);
		flipImageH(buffer, imageData.width, imageData.height);
		ctx.putImageData(imageData, 0, 0);
	} else {
		let temp = createIndexData(h, w);
		copyMirrorImageXY(data, temp.data, w, h);
		flipImageH(temp.data, temp.width, temp.height);
		copyBuffer(temp.data, data, w * h);
		indexData.width = h;
		indexData.height = w;
		
		let tempImageData = ctx.createImageData(ctx.canvas.height, ctx.canvas.width),
			tempBuffer = new Uint32Array(tempImageData.data.buffer);
		copyMirrorImageXY(buffer, tempBuffer, imageData.width, imageData.height);
		flipImageH(tempBuffer, tempImageData.width, tempImageData.height);
		ctx.canvas.width = imageData.height;
		ctx.canvas.height = imageData.width;
		ctx.putImageData(tempImageData, 0, 0);
	}
}

// 左90度回転
function rotate90L(ctx, indexData) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height;
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
		buffer = new Uint32Array(imageData.data.buffer);
	
	if(w === h) {
		mirrorImageXY(data, w, h);
		flipImageV(data, w, h);
		
		mirrorImageXY(buffer, imageData.width, imageData.height);
		flipImageV(buffer, imageData.width, imageData.height);
		ctx.putImageData(imageData, 0, 0);
	} else {
		let temp = createIndexData(h, w);
		copyMirrorImageXY(data, temp.data, w, h);
		flipImageV(temp.data, temp.width, temp.height);
		copyBuffer(temp.data, data, w * h);
		indexData.width = h;
		indexData.height = w;
		
		let tempImageData = ctx.createImageData(ctx.canvas.height, ctx.canvas.width),
			tempBuffer = new Uint32Array(tempImageData.data.buffer);
		copyMirrorImageXY(buffer, tempBuffer, imageData.width, imageData.height);
		flipImageV(tempBuffer, tempImageData.width, tempImageData.height);
		ctx.canvas.width = imageData.height;
		ctx.canvas.height = imageData.width;
		ctx.putImageData(tempImageData, 0, 0);
	}
}

function mirrorImageXY(data, w, h) {
	for(let i = 0; i < h; i++) {
		let y = i * w;
		for(let j = i + 1; j < w; j++) {
			let tmp = data[y + j];
			data[y + j] = data[j * h + i];
			data[j * h + i] = tmp;
		}
	}
	return data;
}

function copyMirrorImageXY(src, dst, w, h) {
	for(let i = 0; i < h; i++) {
		let y = i * w;
		for(let j = 0; j < w; j++) {
			dst[j * h + i] = src[y + j];
		}
	}
	return dst;
}

// 水平方向シフト
function shiftH(ctx, indexData, shift, scale) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		tmp = createIndexData(w, h);
	shiftImageH(data, tmp.data, w, h, shift);
	indexData.data = tmp.data;
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
		tmpData = ctx.createImageData(imageData.width, imageData.height),
		buffer = new Uint32Array(imageData.data.buffer),
		tmpBuffer = new Uint32Array(tmpData.data.buffer);
	shiftImageH(buffer, tmpBuffer, imageData.width, imageData.height, shift * scale);
	ctx.putImageData(tmpData, 0, 0);
}

function shiftImageH(data, tmp, w, h, shift) {
	for(let i = 0; i < h; i++) {
		let y = i * w;
		for(let j = 0; j < w; j++) {
			tmp[y + (w + j + shift) % w] = data[y + j];
		}
	}
}

// 垂直方向シフト
function shiftV(ctx, indexData, shift, scale) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		tmp = createIndexData(w, h);
	shiftImageV(data, tmp.data, w, h, shift);
	indexData.data = tmp.data;
	
	let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
		tmpData = ctx.createImageData(imageData.width, imageData.height),
		buffer = new Uint32Array(imageData.data.buffer),
		tmpBuffer = new Uint32Array(tmpData.data.buffer);
	shiftImageV(buffer, tmpBuffer, imageData.width, imageData.height, shift * scale);
	ctx.putImageData(tmpData, 0, 0);
}

function shiftImageV(data, tmp, w, h, shift) {
	for(let i = 0; i < h; i++) {
		let y = i * w,
			yy = ((h + i + shift) % h) * w;
		for(let j = 0; j < w; j++) {
			tmp[yy + j] = data[y + j];
		}
	}
}

// 指定のインデックスのピクセルを透明にする
function drawClearColor(ctx, indexData, index, scale) {
	let data = indexData.data,
		w = indexData.width,
		h = indexData.height,
		s = scale,
		l, i, j;
	for(i = 0; i < h; i++) {
		l = 0;
		for(j = 0; j < w; j++) {
			if(data[i * w + j] === index) {
				l++;
			} else if(l > 0) {
				ctx.clearRect((j - l) * s, i * s, s * l, s);
				l = 0;
			}
		}
		if(l > 0) {
			ctx.clearRect((j - l) * s, i * s, s * l, s);
		}
	}
}

// 入力した画像をインデックスカラーイメージに変換する
// 色数が256色を超えた時点でエラーにする
function convertIndexedImage(src, indexData, paletteData) {
	let count = 0,
		palette = [],
		data = src.data,
		idx = indexData.data,
		pal = paletteData.data;
	for(let i = 0, j = 0, n = data.length; i < n; i += 4, j++) {
		let r = data[i],
			g = data[i + 1],
			b = data[i + 2],
			a = data[i + 3],
			color = Color.rgb(r, g, b),
			index = palette.indexOf(color);
		if(index < 0) {
			palette.push(color);
			index = count++;
			let p = index * 4;
			pal[p] = r;
			pal[p + 1] = g;
			pal[p + 2] = b;
			pal[p + 3] = 255;
			
			if(count > 256) {
				throw '色数オーバー';
			}
		}
		idx[j] = index;
	}
	
	return pal;
}

// フルカラーイメージをインデックスイメージに変換する
function convertIndexedImageByPalette(src, indexData, paletteData, backIndex) {
	let data = src.data,
		idx = indexData.data,
		pal = paletteData.data;
	
	for(let i = 0, n = data.length; i < n; i += 4) {
		let r = data[i],
			g = data[i + 1],
			b = data[i + 2],
			a = data[i + 3],
			index = -1;
		
		for(let j = 0; j < pal.length; j += 4) {
			if(r === pal[j] && g === pal[j + 1] && b === pal[j + 2]) {
				index = j / 4;
				break;
			}
		}
		idx[i / 4] = index;
	}
}


// 画像の差分の最初と最後を取得する
function diffIndexData(src, dst) {
	let head = src.length,
		tail = 0,
		n = src.length;
	for(let i = 0; i < n; i++) {
		if(dst[i] !== src[i]) {
			head = i;
			break;
		}
	}
	for(let i = n - 1; i >= 0; i--) {
		if(dst[i] !== src[i]) {
			tail = i;
			break;
		}
	}
	return { head: head, tail: tail };
}

// インデックスデータの作成
function createIndexData(w, h) {
	return {
		width: w,
		height: h,
//		data: new Uint8ClampedArray(w * h)
		data: new Uint8Array(w * h)
	};
}

// パレットデータの作成
function createPaletteData(n) {
	return {
		count: n,
//		data: new Uint8ClampedArray(n * 4)
		data: new Uint8Array(n * 4)
	};
}

// 拡大した画像を返す
function scaling(indexData, scale) {
	let w = indexData.width * scale ^ 0,
		h = indexData.height * scale ^ 0,
		dst = createIndexData(w, h),
		stride = indexData.width,
		d = dst.data,
		s = indexData.data;
	
	for(let i = 0; i < h; i++) {
		for(let j = 0; j < w; j++) {
			d[i * w + j] = s[(i * stride + j) / scale ^ 0];
		}
	}
	return dst;
}

function copyBuffer(src, dst, length) {
	for(let i = 0; i < length; i++) {
		dst[i] = src[i];
	}
}

// 指定範囲のインデックスデータをコピーする
function copyRangeIndexData(src, dst, range) {
	let i = range ? range.head : 0,
		n = range ? range.tail : src.data.length,
		s = src.data,
		d = dst.data;
//	console.log('copyRange', i, n);
	for(; i < n; i++) {
		d[i] = s[i];
	}
}

// インデックスデータをコピーする
function copyIndexData(src, dst, sx, sy, w, h, dx, dy, index) {
	console.log('copyIndex', sx, sy, w, h, dx, dy);
	let s = src.data,
		d = dst.data,
		sw = src.width,
		dw = dst.width,
		dh = dst.height;
	dx = dx || 0;
	dy = dy || 0;
	if(dx < 0) {
		w += dx;
		sx -= dx;
		dx = 0;
	}
	if(dy < 0) {
		h += dy;
		sy -= dy;
		dy = 0;
	}
	w = dx + w >= dw ? dw - dx : w;
	h = dy + h >= dh ? dh - dy : h;
	for(let i = 0; i < h; i++) {
		let y = (i + sy) * sw,
			z = (i + dy) * dw;
		for(let j = 0; j < w; j++) {
			let x = j + sx;
			if(index !== s[y + x]) {
				d[z + j + dx] = s[y + x];
			}
		}
	}
}

function pasteIndexData(src, dst, x, y, sw, sh, dw, dh) {
	let w = x + dw > sw ? sw : dw,
		h = y + dh > sh ? sh : dh;
	for(let i = 0; i < h; i++) {
		for(let j = 0; j < w; j++) {
//			dst[] = src[];
		}
	}
}

// インデックスデータを塗りつぶす
function fillIndexData(src, index, x, y, w, h) {
	let data = src.data,
		width = src.width;
	for(let i = y; i < y + h; i++) {
		let n = i * width;
		for(let j = x; j < x + w; j++) {
			data[n + j] = index;
		}
	}
}

// 未使用色の削除
function removeUnusedColor(indexData, palette) {
	let data = indexData.data,
		used = [];
	
	for(let i = 0; i < palette.length; i++) {
		used.push(0);
	}
	
	let max = 0;
	
	for(let i = 0, l = data.length; i < l; i++) {
		let index = data[i];
		used[index]++;
		if(index > max) max = index;
	}
	
	let k = 0;
	for(i = 0; i <= max; i++) {
		if(used[i] > 0) {
			palette[k] = palette[i];
			used[i] = k++;
		}
	}
	
	for(i = k; i < palette.length; i++) {
		palette[i] = '#000000';
	}
	
	for(i = 0; i < l; i++) {
		index = data[i];
		data[i] = used[index];
	}
}

// インデックスの値を置換する
function swapColor(indexData, a, b) {
	let data = indexData.data;
	
	for(let i = 0, l = data.length; i < l; i++) {
		if(data[i] === a) {
			data[i] = b;
		} else if(data[i] == b) {
			data[i] = a;
		}
	}
}

// イメージを結合する
function combineIndexData(src, dst, mask) {
	let s = src.data,
		d = dst.data;
	for(let i = 0, l = data.let; i < l; i++) {
		if(s[i] !== mask) {
			d[i] = s[i];
		}
	}
}

