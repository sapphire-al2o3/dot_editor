/*jslint bitwise: true */
(function (global) {
	'use strict';
	
	function hex(v) {
		return ('0' + (v ^ 0).toString(16)).slice(-2);
	}
	
	function rgb2str(r, g, b) {
		return '#' + hex(r) + hex(g) + hex(b);
	}
	
	function rgba2str(r, g, b, a) {
		return 'rgba(' + (r & 0xFF) + ',' + (g & 0xFF) + ',' + (b & 0xFF) + ',' + a + ')';
	}
	
	function array2str(a) {
		return rgb2str(a[0], a[1], a[2]);
	}
	
	function hsv2rgb(h, s, v) {
		var f = h / 60,
			i = f ^ 0,
			m = v - v * s,
			k = v * s * (f - i),
			p = v - k,
			q = k + m;
		return [[v, p, m, m, q, v][i] * 255 ^ 0, [q, v, v, p, m, m][i] * 255 ^ 0, [m, m, q, v, v, p][i] * 255 ^ 0];
	}
	
	function rgb2hsv(r, g, b) {
		let m = Math.max(r, g, b),
			n = Math.min(r, g, b),
			c = m - n,
			h = 0;
		if (c === 0) return [0, 0, m / 255];
		if (m === r) h = (g - b) / c;
		else if (m === g) h = (b - r) / c + 2;
		else if (m === b) h = (r - g) / c + 4;
		if (h < 0) h += 6;
		return [h * 60 ^ 0, c / m, m / 255];
	}
	
	function str2rgb(str) {
		if (str[0] === '#') {
			if (str.length === 7) {
				return [parseInt(str.slice(1, 3), 16), parseInt(str.slice(3, 5), 16), parseInt(str.slice(5), 16)];
			} else if (str.length === 4) {
				return [parseInt(str[1] + str[1], 16), parseInt(str[2] + str[2], 16), parseInt(str[3] + str[3], 16)];
			}
		} else {
			var c = str.match(/(\d+)/g);
			return [parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)];
		}
	}
	
	var Color = {
		rgb: rgb2str,
		rgba: rgba2str,
		hsv: hsv2rgb,
		rgb2hsv: rgb2hsv,
		strToRGB: str2rgb
	};
	
	global.Color = Color;
	
})(this);
