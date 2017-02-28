/*

パレット

to do
・背景色選択
・16進切り替え
・色の並べ替え
・色のコピー
・未使用色の削除

bug
・拡大した状態でカラーバーのドラッグが効かなくなる？
・カラーピッカーでドラッグした時に色が変わらない

done
・(fix)初期の色とHSVの値表示があっていない
・(fix)HueのバーでHがマイナスになる場合がある
・スピンボタンのキーリピート
・一番左に黒い線が出る
・(fix)スピンボタンを連打すると2ずつ増える
・ドラッグでカラーバーの色を変更
・カラーバーにカーソルをつける
・(fix)カーソルバーを動かした時に位置がずれる

require('selector.js')
require('color.js')

*/

(function(global, $, Color) {
	'use strict';
	
	var document = $.d;

	function range(v, min, max) {
		return v > max ? max : v < min ? min : v;
	}

	// グラデーションを設定する
	function setGradient(elm, start, end) {
		var bender = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
		for(var i = 0, l = bender.length; i < l; i++) {
			elm.style['background'] = bender[i] + 'linear-gradient(left,' + start + ',' + end + ')';
		}
	}
	
	// トランジションを設定する
	function setTransition(elm, enable) {
		var bender = ['webkit', 'moz', 'ms', 'o', ''],
			events = ['webkitTransitionEnd', 'transitionend', 'transitionend', 'oTransitionEnd', 'transitionend'];
		for(var i = 0, l = bender.length; i < l; i++) {
			elm.style[bender[i] + 'Transition'] = enable ? 'all 0.2s ease' : 'none';
			$.bind(elm, events[i], function() {
				elm.style[bender[i] + 'Transition'] = 'none';
			});
		}
	}
	
	// パレット
	var Palette = function (d) {
		
		var paletteElement = null,
			table = null,
			selected = null,
			frontColor = '',
			backColor = '',
			frontIndex = 0,
			backIndex = 0,
			cells = [],
			palettes = [],
			record = [],
			bars = [],
			nums = [],
			onchange;
		
		// 指定のパレットの色を変更する
		function setColor(color, index, event) {
			palettes[index] = color;
			selected.style.backgroundColor = color;
			selected.setAttribute('title', color);
			if(!event && onchange) {
				onchange();
			}
		}
		
		// パレットを生成する
		function createPalette(elm) {
			var i, j, tr, td, span;
			paletteElement = $(elm);
			table = $.q('#palette table tbody');
			bars = [$('r-bar'), $('g-bar'), $('b-bar')];
			nums = [$('color-num-r'), $('color-num-g'), $('color-num-b')];
			
			// create palette table
			for (i = 0; i < 16; i += 1) {
				tr = d.createElement('tr');
				for (j = 0; j < 16; j += 1) {
					td = d.createElement('td');
//					span = d.createElement('span');
//					span.textContent = '#FFF';
//					td.appendChild(span);
					cells.push(td);
					td.setAttribute('title', Color.rgb(0, 0, 0));
					td.style.backgroundColor = Color.rgb(0, 0, 0);
					tr.appendChild(td);
					palettes.push(Color.rgb(0, 0, 0));
				}
				table.appendChild(tr);
			}
			table.addEventListener('click', function (e) {
				if (e.target.localName === 'td') {
					var row = e.target.parentNode.rowIndex,
						col = e.target.cellIndex;
					
					//setTransition(bars[0].firstChild, true);
					//setTransition(bars[1].firstChild, true);
					//setTransition(bars[2].firstChild, true);
					
					selected.className = '';
					selected = e.target;
					selected.className = ' selected';
					frontIndex = row * 16 + col;
					
					if(copy) {
						if(active) {
							palettes[frontIndex] = palettes[startIndex];
							e.target.style.backgroundColor = active.style.backgroundColor;
							active.className = '';
							active = null;
							copy = false;
							setPaletteTool();
							if(onchange) onchange();
						} else {
							active = e.target;
							active.className = 'start';
							startIndex = frontIndex;
						}
					}
					
					if(swap) {
						if(active) {
							var t = palettes[startIndex];
							palettes[startIndex] = palettes[frontIndex];
							palettes[frontIndex] = t;
							e.target.style.backgroundColor = palettes[frontIndex];
							active.style.backgroundColor = palettes[startIndex];
							active.className = '';
							active = null;
							if(onchange) onchange();
						} else {
							active = e.target;
							active.className = 'start';
							startIndex = frontIndex;
						}
					}
					
					if(transparent) {
						backIndex = frontIndex;
					}
					
					selectColor(selected.style.backgroundColor);
				}
			}, false);
			
			var down = false,
				activeIndex,
				startColor,
				startIndex,
				color,
				start,
				active,
				tool,
				copy = false,
				swap = false,
				transparent = false,
				hex = false;
			
			// ドラッグでセルのコピー
			function downCell(e) {
				if (e.target.localName === 'td') {
					var row = e.target.parentNode.rowIndex,
						col = e.target.cellIndex;
					activeIndex = row * 16 + col;
					active = e.target;
					start = e.target;
					startColor = e.target.style.backgroundColor;
					startIndex = activeIndex;
					table.style.cursor = 'default';
					down = true;
				}
				e.preventDefault();
				return false;
			}
			
			function upCell(e) {
				down = false;
//				table.removeEventListener('mouseup', upCell, false);
//				table.removeEventListener('mousemove', moveCell, false);
				var t = palettes[startIndex];
				palettes[startIndex] = palettes[activeIndex];
				palettes[activeIndex] = t;
				e.preventDefault();
				return false;
			}
			
			function moveCell(e) {
				if (down && e.target.localName === 'td') {
					var row = e.target.parentNode.rowIndex,
						col = e.target.cellIndex;
					if(activeIndex !== row * 16 + col) {
						active.style.backgroundColor = color;
						color = e.target.style.backgroundColor;
						start.style.backgroundColor = color;
						e.target.style.backgroundColor = startColor;
						activeIndex = row * 16 + col;
						active = e.target;
					}
				}
			}
//			table.addEventListener('mousedown', downCell);
//			table.addEventListener('mousemove', moveCell);
//			table.addEventListener('mouseup', upCell);
			
			// 0番目のパレットを選択しておく
			selected = cells[0];
			selected.className = 'selected';
			selectColor(selected.style.backgroundColor);
			
			function getNumValue(i) {
				var radix = nums[i].getAttribute('radix') ^ 0;
				return parseInt(nums[i].value, radix);
			}
			
			// spin event
			function changeSpin() {
				var r = getNumValue(0),
					g = getNumValue(1),
					b = getNumValue(2),
					color = Color.rgb(r, g, b);
				selectColor(color);
				setColor(color, frontIndex);
			}
			
			// 数値入力ボックス
			nums.forEach(function(e) {
				e.addEventListener('change', changeSpin, false);
			});
			
			// スピンボタン
			Array.prototype.forEach.call($.qa('.left, .right'), function(e) {
				Spin(e, changeSpin);
			});
			
			// color slider event
			bars.forEach(function(e) {
				var down = false,
					target = e,
					left = 0,
					border = 1,
					width = target.clientWidth - 1,
					color,
					cursor = e.firstChild,
					input;
	
				function mousedownHandler(e) {
					width = target.clientWidth - 1;
					left = target.getBoundingClientRect().left;
					var x = e.clientX - left - border,
						v = range(x / width, 0.0, 1.0);
					input = $(target.getAttribute('for'));
					input.value = (v * 255 ^ 0).toString(input.getAttribute('radix') ^ 0);
					var r = getNumValue(0),
						g = getNumValue(1),
						b = getNumValue(2);
					color = Color.rgb(r, g, b);
					selectColor([r, g, b]);
					setColor(color, frontIndex);
					down = true;
					$.bind('mousemove', mousemoveHandler);
					$.bind('mouseup', mouseupHandler);
					//cursor.style['left'] = range(x, -border, width - border) + 'px';
					//console.log(r, x, border, width);
					e.preventDefault();
					return false;
				}
				
				function mousemoveHandler(e) {
					if(down) {
						var x = e.clientX - left - border,
							v = range(x / width, 0.0, 1.0);
						input.value = (v * 255 ^ 0).toString(input.getAttribute('radix') ^ 0);
						var r = getNumValue(0),
							g = getNumValue(1),
							b = getNumValue(2);
						selectColor([r, g, b]);
						color = Color.rgb(r, g, b, 1.0);
						//x = range(x, -border, width - border + 1);
						//cursor.style['left'] = x + 'px';
					}
					return false;
				}
				function mouseupHandler(e) {
					if(down) {
						$.unbind('mousemove', mousemoveHandler, false);
						$.unbind('mouseup', mouseupHandler, false);
						down = false;
						setColor(color, frontIndex);
					}
				}
				$.bind(target, 'mousedown', mousedownHandler);
			});
			
			function setPaletteTool() {
				if(active) active.className = '';
				active = null;
				$('palette-copy').className = copy ? 'selected' : '';
				$('palette-swap').className = swap ? 'selected' : '';
				$('palette-transparent').className = transparent ? 'selected' : '';
			}
			
			$.bind($('palette-copy'), 'click', function(e) {
				copy = !copy;
				swap = false;
				transparent = false;
				setPaletteTool();
			});
			
			$.bind($('palette-swap'), 'click', function(e) {
				swap = !swap;
				copy = false;
				transparent = false;
				setPaletteTool();
			});
//			$.bind($('palette-transparent'), 'click', function(e) {
//				copy = false;
//				swap = false;
//				transparent = !transparent;
//				setPaletteTool();
//			});
//			$.bind($('palette-hex'), 'click', function(e) {
//				hex = !hex;
//				this.className = hex ? 'selected' : '';
//				setRadix(hex ? 16 : 10);
//			});
			
			paletteElement.style.display = 'block';
		}
		
		function setNumValue(i, v) {
			var radix = nums[i].getAttribute('radix');
			return v.toString(radix);
		}
		
		// パレットの色を選択する
		function selectColor(color, cursor, x) {
			var r, g, b;
			if(typeof color === 'string') {
				var c = Color.str(color);
				r = c[0];
				g = c[1];
				b = c[2];
			} else {
				r = color[0];
				g = color[1];
				b = color[2];
				color = Color.rgb(r, g, b);
			}
			
			$q('#front-color').style.backgroundColor = color;
			nums[0].value = setNumValue(0, r);
			nums[1].value = setNumValue(1, g);
			nums[2].value = setNumValue(2, b);
			setGradient(bars[0], Color.rgb(0, g, b), Color.rgb(255, g, b));
			setGradient(bars[1], Color.rgb(r, 0, b), Color.rgb(r, 255, b));
			setGradient(bars[2], Color.rgb(r, g, 0), Color.rgb(r, g, 255));
			if(cursor) {
				cursor.style['left'] = x + 'px';
			} else {
				r = (r * 96 / 255 ^ 0);
				g = (g * 96 / 255 ^ 0);
				b = (b * 96 / 255 ^ 0);
				bars[0].firstChild.style.left = range(r, 0, 96) - 2 + 'px';
				bars[1].firstChild.style.left = range(g, 0, 96) - 2 + 'px';
				bars[2].firstChild.style.left = range(b, 0, 96) - 2 + 'px';
			}
			frontColor = color;
		}
		
		// 基数を設定する
		function setRadix(r) {
			nums.forEach(function(e) {
				var elm = e,
					radix = elm.getAttribute('radix') ^ 0,
					val = parseInt(elm.value, radix);
				elm.setAttribute('radix', r);
				elm.value = val.toString(r);
			});
		}
		
		return {
			create: function(elm) {
				createPalette(elm);
			},
			clear: function() {
				
			},
			setPaletteData: function(p) {
				if(Array.isArray(p)) {
					p.forEach(function(e, i) {
						cells[i].style.backgroundColor = e;
						cells[i].setAttribute('title', e);
					});
					for(var i = 0, n = p.length; i < n; i++) {
						palettes[i] = p[i];
					}
					frontColor = p[frontIndex];
				} else {
					var data = p.data;
					for(var i = 0, j = 0; i < p.count; i++, j += 4) {
						var color = Color.rgb(data[j], data[j + 1], data[j + 2]);
						cells[i].style.backgroundColor = color;
						cells[i].setAttribute('title', color);
						palettes[i] = color;
					}
					frontColor = p[frontIndex];
				}
			},
			getPaletteData: function() {
				return palettes;
			},
			convert: function(p) {
				var data = p.data;
				for(var i = 0, n = data.length; i < n; i += 4) {
					var c = Color.str(palettes[i >> 2]);
					data[i] = c[0];
					data[i + 1] = c[1];
					data[i + 2] = c[2];
					data[i + 3] = 255;
				}
			},
			getFrontColor: function() {
				return frontColor;
			},
			getFrontIndex: function() {
				return frontIndex;
			},
			setFrontColor: function(index) {
				selected.className = '';
				selected = cells[index];
				console.assert(selected !== undefined, index);
				selected.className = 'selected';
				frontIndex = index;
				selectColor(palettes[index]);
			},
			getBackColor: function() {
				return backColor;
			},
			getBackIndex: function() {
				return backIndex;
			},
			setColor: function(color) {
				setColor(color, frontIndex);
				selectColor(color);
			},
			change: function(f) {
				onchange = f;
			},
			hex: function(h) {
				// 16進数表記にする
				setRadix(h ? 16 : 10);
			},
			setColorPicker: function(f) {
				$('front-color').addEventListener('click', f, false);
			},
			orderColor: function(data) {
				// 未使用色の削除
				cells.forEach(function(e, i) {
					e.style.backgroundColor = palette[i];
				});
			}
		};
	}(document);

	// スピンボタン
	var Spin = function() {
		var down = false,
			target,
			timerId = 0,
			radix = 10,
			min = 0,
			max = 100,
			step = 1,
			delay = 200,
			interval = 100,
			repeat = false,
			onchange;
		
		function setValue(target) {
			var val = parseInt(target.value, radix);
			val = isNaN(val) ? min : range(val + step, min, max);
			target.value = val.toString(radix).toUpperCase();
			
			if(onchange) {
				onchange();
			}
		}
		
		function mousedownHandler(e) {
			target = $(this.getAttribute('for'));
			radix = target.getAttribute('radix') === '16' ? 16 : 10;
			min = parseInt(target.getAttribute('min'), 10);
			max = parseInt(target.getAttribute('max'), 10);
			step = parseInt(this.getAttribute('step'), 10);
			setValue(target);
			
			down = true;
			
			if(!repeat) {
				clearInterval(timerId);
				repeat = true;
				setTimeout(function() {
					timerId = setInterval(repeatHandler, interval);
				}, delay);
			}
			
			e.preventDefault();
			return false;
		}
		
		function mouseupHandler(e) {
			down = false;
			return false;
		}
		
		function mouseoutHandler(e) {
			down = false;
			return false;
		}
		
		function repeatHandler() {
			if(!down) {
				clearInterval(timerId);
				repeat = false;
			} else {
				setValue(target);
			}
		}
		
		return function(elm, f) {
			onchange = f;
			$.bind(elm, 'mousedown', mousedownHandler);
			$.bind(elm, 'mouseup', mouseupHandler);
			$.bind(elm, 'mouseout', mouseoutHandler);
		};
	}();
	
	// スライダー
	var Slider = function() {
		var down = false,
			value = 0,
			length = 1,
			target,
			cursor;
		
		function mousedonwHandler(e) {
			down = true;
			$.bind('mouseup', mouseupHandler);
			$.bind('mousemove', mousemoveHandler);
		}
		
		function mousemoveHandler(e) {
			if(down) {
			
			}
		}
		
		function mouseupHandler(e) {
			down = false;
			$.unbind('mouseup', mouseupHandler);
			$.unbind('mousemove', mousemoveHandler);
		}
		
		return function(e, f) {
			change = f;
			target = e;
			length = e.offsetWidth,
			cursor = target.firstChild;
			$.bind(target, 'mousedown', mousedownHandler);
			
			return {
				value: value,
				position: function(x) {
					this.value = x / length;
				}
			};
		};
	}();

	global.Palette = Palette;
	
})(this, Selector, Color);
