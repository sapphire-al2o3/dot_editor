/*
 * BASE64 encode & decode
 */
(function(global) {
	'use strict';
	const Base64 = function() {
		const e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
			d = {},
			l = e.length;
		
		for (let i = 0; i < l; i += 1) {
			d[e[i]] = i;
		}
	
		return {
			encode(a, s) {
				let l = s === undefined ? a.length : s,
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
			decode(b, a) {
				if (a === undefined) {
					a = [];
				}
				
				let l = b.length;
				
				b[l - 1] === '=' && l--;
				b[l - 1] === '=' && l--;
				b[l - 1] === '=' && l--;
				
				let m = b.length - l,
					i = 0,
					j = 0,
					k;
				
				for (; i <= l - 4; i += 4) {
					k = (d[b[i]] << 18) | (d[b[i + 1]] << 12) | (d[b[i + 2]] << 6) | d[b[i + 3]];
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
			decodeSize(b) {
				const l = b.length;
				if (l >= 4) {
					let s = l / 4 * 3;
					b[l - 1] === '=' && s--;
					b[l - 2] === '=' && s--;
					b[l - 3] === '=' && s--;
					return s;
				}
				return 0;
			},
			check(b) {
				const l = b.length;
				for (let i = 0; i < l; i++) {
					if (!(b[i] in d)) {
						return false;
					}
				}
				return true;
			}
		};
	
	}();
	
	const RLE = {
		encode(b, a) {
			if(a === undefined) {
				a = [];
			}
			let l = b.length,
				i = 0,
				j = 0;
			do {
				let length = 0,
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
					
					if(j >= l - 1) {
						length++;
						j++;
					}
					
					a[i++] = length - 1;
					for(let k = 0; k < length; k++, t++) {
						a[i++] = b[t];
					}
				}
			} while(j < l);
			return a;
		},
		decode(b, a) {
			if(a === undefined) {
				a = [];
			}
			let i = 0,
				j = 0,
				l = b.length;
			while(j < l) {
				let p = b[j++],
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
	const BWT = {
		encode: function(b, a) {
			if(a === undefined) {
				a = [];
			}
			let block = [],
				l = b.length,
				d = b.concat(b);
			
			for(let i = 0; i < l; i++) {
				block[i] = d.slice(i, l + i);
			}
			
			
			/*
			for(var j = 0; j < l; j++) {
				block.push(line.join(''));
				var v = line.shift(0);
				line.push(v);
			}*/
			
			
			block.sort();
			
			
			for(let j = 0; j < l; j++) {
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
