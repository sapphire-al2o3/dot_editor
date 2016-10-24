/*
 * BASE64 encode & decode
 */
(function(global) {
	'use strict';
	var Base64 = function () {
		var e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
			d = {},
			i = 0,
			l = e.length;
		
		for (i = 0; i < l; i += 1) {
			d[e[i]] = i;
		}
	
		return {
			encode: function (a, s) {
				var l = s === undefined ? a.length : s,
					m = l % 3,
					r = [],
					i = 0,
					j = 0;
				
				for (i = 0; i <= l - 3; i += 3) {
					j = (a[i] << 16) | (a[i + 1] << 8) | a[i + 2];
					r.push(e[j >> 18 & 63], e[j >> 12 & 63], e[j >> 6 & 63], e[j & 63]);
				}
				
				if (m === 1) {
					j = a[i] << 16;
					r.push(e[j >> 18 & 63], e[j >> 12 & 63], '==');
				} else if (m === 2) {	
					j = (a[i] << 16) | (a[i + 1] << 8);
					r.push(e[j >> 18 & 63], e[j >> 12 & 63], e[j >> 6 & 63], '=');
				}
				
				return r.join('');
			},
			decode: function (b, a) {
				if (a === undefined) {
					a = [];
				}
				
				var l = b.length;
				
				b[l - 1] === '=' && l--;
				b[l - 1] === '=' && l--;
				b[l - 1] === '=' && l--;
				
				var m = b.length - l;
				
				for (var i = 0, j = 0; i <= l - 4; i += 4) {
					var k = (d[b[i]] << 18) | (d[b[i + 1]] << 12) | (d[b[i + 2]] << 6) | d[b[i + 3]];
					a[j++] = k >> 16 & 255;
					a[j++] = k >> 8 & 255;
					a[j++] = k & 255;
				}
				
				if (m === 1) {
					k = (d[b[i]] << 18) | (d[b[i + 1]] << 12) | (d[b[i + 2]] << 6);
					a[j++] = k >> 16 & 255;
					a[j] = k >> 8 & 255;
				} else if (m === 2) {
					k = (d[b[i]] << 18) | (d[b[i + 1]] << 12);
					a[j] = k >> 16 & 255;
				}
				
				return a;
			},
			decodeSize: function (b) {
				var l = b.length;
				if (l >= 4) {
					var s = l / 4 * 3;
					b[l - 1] === '=' && s--;
					b[l - 2] === '=' && s--;
					b[l - 3] === '=' && s--;
					return s;
				}
				return 0;
			},
			check: function (b) {
				var l = b.length;
				for (var i = 0; i < l; i++) {
					if (!(b[i] in d)) {
						return false;
					}
				}
				return true;
			}
		};
	
	}();
	
	var RLE = {
		encode: function(b, a) {
			if(a === undefined) {
				a = [];
			}
			var l = b.length,
				i = 0,
				j = 0;
			do {
				var length = 0,
					t = j,
					p = b[j],
					r = j + 1 < l && p === b[j + 1];
				
				if(r) {
					while(j < l - 1 && p === b[j + 1] && length !== 127) {
						j++;
						length++;
					}
					j++;
					
					a[i++] = length | 128;
					a[i++] = p;
				} else {
					while(j < l - 1 && b[j] !== b[j + 1] && length !== 127) {
						j++;
						length++;
					}
					j++;
					
					a[i++] = length;
					for(var k = 0; k <= length; k++, t++) {
						a[i++] = b[t];
					}
				}
			} while(j < l);
			return a;
		},
		decode: function(b, a) {
			if(a === undefined) {
				a = [];
			}
			var i = 0,
				j = 0,
				l = b.length;
			while(j < l) {
				var p = b[j++],
					n = (p & 127) + 1,
					k;
				if(p & 128) {
					p = b[j++];
					for(k = 0; k < n; k++) {
						a[i++] = p;
					}
				} else {
					for(k = 0; k < n; k++) {
						a[i++] = b[j++];
					}
				}
			}
			return a;
		}
	};

	// block sorting
	var BWT = {
		encode: function(b, a) {
			if(a === undefined) {
				a = [];
			}
			var block = [],
				l = b.length,
				d = b.concat(b);
			
			for(var i = 0; i < l; i++) {
				block[i] = d.slice(i, l + i);
			}
			
			
			/*
			for(var j = 0; j < l; j++) {
				block.push(line.join(''));
				var v = line.shift(0);
				line.push(v);
			}*/
			
			
			block.sort();
			
			
			for(var j = 0; j < l; j++) {
				a.push(block[j][l - 1]);
			}
			
			return a;
		},
		decode: function (b, a) {
			
		}
	};
	
	global.Base64 = Base64;
	global.RLE = RLE;
})(this);
