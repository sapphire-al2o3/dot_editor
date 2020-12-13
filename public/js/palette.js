/*

パレット

to do
・背景色選択
・16進切り替え
・色の並べ替え
・色のコピー

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
・未使用色の削除

require('selector.js')
require('color.js')

*/

(function(global, $, Color) {
	'use strict';
	
	const document = $.d;

	function range(v, min, max) {
		return v > max ? max : v < min ? min : v;
	}

	// グラデーションを設定する
	function setGradient(elm, start, end) {
		let bender = ['-webkit-', '-moz-', '-ms-', '-o-', ''];
		for(let i = 0, l = bender.length; i < l; i++) {
			elm.style['background'] = bender[i] + 'linear-gradient(left,' + start + ',' + end + ')';
		}
	}
	
	// トランジションを設定する
	function setTransition(elm, enable) {
		let bender = ['webkit', 'moz', 'ms', 'o', ''],
			events = ['webkitTransitionEnd', 'transitionend', 'transitionend', 'oTransitionEnd', 'transitionend'];
		for(let i = 0, l = bender.length; i < l; i++) {
			elm.style[bender[i] + 'Transition'] = enable ? 'all 0.2s ease' : 'none';
			$.bind(elm, events[i], () => {
				elm.style[bender[i] + 'Transition'] = 'none';
			});
		}
	}
	
	// パレット
	const Palette = function (d) {
		
		let paletteElement = null,
			table = null,
			selected = null,
			frontColor = '',
			backColor = '',
			frontIndex = 0,
			backIndex = 0,
			transparentIndex = 0,
			cells = [],
			palettes = [],
			bars = [],
			nums = [],
			onchange,
			history = [];
		
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
			paletteElement = $(elm);
			table = $.q('#palette table tbody');
			bars = [$('r-bar'), $('g-bar'), $('b-bar')];
			nums = [$('color-num-r'), $('color-num-g'), $('color-num-b')];
			
			// create palette table
			for (let i = 0; i < 16; i += 1) {
				let tr = d.createElement('tr');
				for (let j = 0; j < 16; j += 1) {
					let td = d.createElement('td');
//					let span = d.createElement('span');
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
			table.addEventListener('click', e => {
				if (e.target.localName === 'td') {
					let row = e.target.parentNode.rowIndex,
						col = e.target.cellIndex;
					
					//setTransition(bars[0].firstChild, true);
					//setTransition(bars[1].firstChild, true);
					//setTransition(bars[2].firstChild, true);
					
					selected.className = '';
					selected = e.target;
					selected.className = ' selected';
					frontIndex = row * 16 + col;
					
					// 色のコピー
					if(copy) {
						if(active) {
							if(selected !== active) {
								record(frontIndex, palettes[startIndex], history.length);
								palettes[frontIndex] = palettes[startIndex];
								e.target.style.backgroundColor = active.style.backgroundColor;
								e.target.setAttribute('title', palettes[frontIndex]);
								active.className = '';
								if(onchange) onchange();
							}
							active = null;
							copy = false;
							setPaletteTool();
						} else {
							active = e.target;
							active.className = 'start';
							startIndex = frontIndex;
						}
					}
					
					// 色の入れ替え、移動
					if(swap || move) {
						if(active) {
							if(selected !== active) {
								const group = history.length;
								record(frontIndex, palettes[startIndex], group);
								record(startIndex, palettes[frontIndex], group);
								let t = palettes[startIndex];
								palettes[startIndex] = palettes[frontIndex];
								palettes[frontIndex] = t;
								e.target.style.backgroundColor = palettes[frontIndex];
								active.style.backgroundColor = palettes[startIndex];
								e.target.setAttribute('title', palettes[frontIndex]);
								active.setAttribute('title', palettes[startIndex]);
								active.className = '';
								if(onchange) onchange(move ? [startIndex, frontIndex] : undefined);
							}
							active = null;
						} else {
							active = e.target;
							active.className = 'start';
							startIndex = frontIndex;
						}
					}

					if(transparent) {
						backIndex = frontIndex;
					}

					if(grad) {
						if(active) {
							if(selected !== active) {
								if(frontIndex > startIndex) {
									createGradient(startIndex, frontIndex);
								} else {
									createGradient(frontIndex, startIndex);
								}
								if(onchange) onchange();
							}
							active = null;
							grad = false;
							setPaletteTool();
						} else {
							active = e.target;
							active.className = 'start';
							startIndex = frontIndex;
						}
					}
					
					selectColor(selected.style.backgroundColor);
				}
			}, false);
			
			table.addEventListener('contextmenu', e => {
				if (e.target.localName === 'td') {
					let row = e.target.parentNode.rowIndex,
						col = e.target.cellIndex;
					
					transparentIndex = row * 16 + col;
					
					if(onchange) onchange();
					
					e.preventDefault();
					e.stopPropagation();
				}
			}, false);
			
			let down = false,
				activeIndex,
				startColor,
				startIndex,
				color,
				start,
				active,
				copy = false,
				swap = false,
				move = false,
				grad = false,
				transparent = false,
				hex = false;
			
			// ドラッグでセルのコピー
			function downCell(e) {
				if (e.target.localName === 'td') {
					let row = e.target.parentNode.rowIndex,
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
				const t = palettes[startIndex];
				palettes[startIndex] = palettes[activeIndex];
				palettes[activeIndex] = t;
				e.preventDefault();
				return false;
			}
			
			function moveCell(e) {
				if (down && e.target.localName === 'td') {
					let row = e.target.parentNode.rowIndex,
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
				let radix = nums[i].getAttribute('radix') ^ 0;
				return range(parseInt(nums[i].value, radix), 0, 255);
			}
			
			// spin event
			function changeSpin() {
				let r = getNumValue(0),
					g = getNumValue(1),
					b = getNumValue(2),
					color = Color.rgb(r, g, b);
				record(frontIndex, color, history.length);
				selectColor(color);
				setColor(color, frontIndex);
			}
			
			// 数値入力ボックス
			nums.forEach(e => {
				e.addEventListener('change', changeSpin, false);
			});
			
			// スピンボタン
			Array.prototype.forEach.call($.qa('.left, .right'), e => {
				Spin(e, changeSpin);
			});
			
			// color slider event
			bars.forEach(e => {
				let down = false,
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
					let x = e.clientX - left - border,
						v = range(x / width, 0.0, 1.0);
					input = $(target.getAttribute('for'));
					const radix = input.getAttribute('radix') ^ 0;
					let r, g, b;
					if(e.shiftKey) {
						const d = parseInt(input.value, radix) - (v * 255 ^ 0);
						r = range(setNumValue(0, getNumValue(0) - d), 0, 255);
						g = range(setNumValue(1, getNumValue(1) - d), 0, 255);
						b = range(setNumValue(2, getNumValue(2) - d), 0, 255);
						nums[0].value = r.toString(radix);
						nums[1].value = g.toString(radix);
						nums[2].value = b.toString(radix);
					} else {
						input.value = (v * 255 ^ 0).toString(radix);
						r = getNumValue(0);
						g = getNumValue(1);
						b = getNumValue(2);
					}
					color = Color.rgb(r, g, b);
					record(frontIndex, color, history.length);
					selectColor([r, g, b]);
					setColor(color, frontIndex);
					down = true;
					$.bind('mousemove', mousemoveHandler);
					$.bind('mouseup', mouseupHandler);
					e.preventDefault();
					return false;
				}
				
				function mousemoveHandler(e) {
					if(down) {
						let x = e.clientX - left - border,
							v = range(x / width, 0.0, 1.0);
						const radix = input.getAttribute('radix') ^ 0;
						let r, g, b;
						if(e.shiftKey) {
							const d = parseInt(input.value, radix) - (v * 255 ^ 0);
							r = range(setNumValue(0, getNumValue(0) - d), 0, 255);
							g = range(setNumValue(1, getNumValue(1) - d), 0, 255);
							b = range(setNumValue(2, getNumValue(2) - d), 0, 255);
							nums[0].value = r.toString(radix);
							nums[1].value = g.toString(radix);
							nums[2].value = b.toString(radix);
						} else {
							input.value = (v * 255 ^ 0).toString(radix);
							r = getNumValue(0);
							g = getNumValue(1);
							b = getNumValue(2);
						}
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
						popHistory(frontIndex, color);
					}
				}
				$.bind(target, 'mousedown', mousedownHandler);
			});
			
			function setPaletteTool() {
				if(active) active.className = 'selected';
				active = null;
				$('palette-copy').className = copy ? 'selected' : '';
				$('palette-swap').className = swap ? 'selected' : '';
				$('palette-move').className = move ? 'selected' : '';
				$('palette-grad').className = grad ? 'selected' : '';
//				$('palette-transparent').className = transparent ? 'selected' : '';
			}
			
			$.bind($('palette-copy'), 'click', e => {
				copy = !copy;
				swap = false;
				move = false;
				grad = false;
				transparent = false;
				setPaletteTool();
			});
			
			$.bind($('palette-swap'), 'click', e => {
				swap = !swap;
				copy = false;
				move = false;
				grad = false;
				transparent = false;
				setPaletteTool();
			});
			$.bind($('palette-move'), 'click', e => {
				move = !move;
				copy = false;
				swap = false;
				grad = false;
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
			$.bind($('palette-undo'), 'click', e => {
				if(history.length > 0) {
					let group = -1;
					while(true) {
						let r = history.pop();
						group = r.group;
						selected.className = '';
						selected = cells[r.index];
						selected.className = 'selected';
						frontIndex = r.index;
						selectColor(r.color);
						setColor(r.color, r.index);
						if(history.length === 0 || history[history.length - 1].group != group) {
							break;
						}
					}
				}
			});
			$.bind($('palette-grad'), 'click', e => {
				move = false;
				copy = false;
				swap = false;
				grad = !grad;
				transparent = false;
				setPaletteTool();
			});
			
			paletteElement.style.display = 'block';
		}
		
		function setNumValue(i, v) {
			const radix = nums[i].getAttribute('radix');
			return v.toString(radix);
		}
		
		// パレットの色を選択する
		function selectColor(color, cursor, x) {
			let r, g, b;
			if(typeof color === 'string') {
				let c = Color.strToRGB(color);
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
				let elm = e,
					radix = elm.getAttribute('radix') ^ 0,
					val = parseInt(elm.value, radix);
				elm.setAttribute('radix', r);
				elm.value = val.toString(r);
			});
		}
		
		function checkHistory(index, color) {
			if(history.length > 0) {
				let latest = history.length - 1,
					r = history[latest];
				if(r.index === index && r.color === color) {
					return true;
				}
			}
			return false;
		}
		
		function popHistory(index, color) {
			if(checkHistory(index, color)) {
				history.pop();
			}
		}
		
		function record(index, color, group) {
			if(color !== palettes[index]) {
				history.push({index: index, color: palettes[index], group: group});
			}
		}

		function createGradient(start, end) {
			if(end - start <= 1) {
				return;
			}
			const s = Color.strToRGB(palettes[start]);
			const e = Color.strToRGB(palettes[end]);
			const d = end - start;
			const r = e[0] - s[0];
			const g = e[1] - s[1];
			const b = e[2] - s[2];
			for(let i = start + 1; i < end; i++) {
				const k = i - start;
				const color = Color.rgb((r * k / d ^ 0) + s[0], (g * k / d ^ 0) + s[1], (b * k / d ^ 0) + s[2]);
				record(i, color, history.length);
				palettes[i] = color;
				cells[i].style.backgroundColor = palettes[i];
				cells[i].setAttribute('title', palettes[i]);
			}
		}
		
		return {
			create: elm => {
				createPalette(elm);
			},
			clear: () => {
				
			},
			setPaletteData: p => {
				if(Array.isArray(p)) {
					p.forEach((e, i) => {
						cells[i].style.backgroundColor = e;
						cells[i].setAttribute('title', e);
					});
					for(let i = 0, n = p.length; i < n; i++) {
						palettes[i] = p[i];
					}
					frontColor = p[frontIndex];
				} else {
					let data = p.data;
					for(let i = 0, j = 0; i < p.count; i++, j += 4) {
						let color = Color.rgb(data[j], data[j + 1], data[j + 2]);
						cells[i].style.backgroundColor = color;
						cells[i].setAttribute('title', color);
						palettes[i] = color;
					}
					frontColor = p[frontIndex];
				}
			},
			getPaletteData: () => {
				return palettes;
			},
			convert: p => {
				let data = p.data;
				for(let i = 0, n = data.length; i < n; i += 4) {
					let c = Color.strToRGB(palettes[i >> 2]);
					data[i] = c[0];
					data[i + 1] = c[1];
					data[i + 2] = c[2];
					data[i + 3] = 255;
				}
			},
			getFrontColor: () => {
				return frontColor;
			},
			getFrontIndex: () => {
				return frontIndex;
			},
			getTransparentIndex: () => {
				return transparentIndex;
			},
			setTransparentIndex: index => {
				transparentIndex = index;
			},
			setFrontColor: index => {
				selected.className = '';
				selected = cells[index];
				console.assert(selected !== undefined, index);
				selected.className = 'selected';
				frontIndex = index;
				selectColor(palettes[index]);
			},
			getBackColor: () => {
				return backColor;
			},
			getBackIndex: () => {
				return backIndex;
			},
			setColor: color => {
				record(frontIndex, color, history.length);
				setColor(color, frontIndex);
				selectColor(color);
			},
			change: f => {
				onchange = f;
			},
			hex: h => {
				// 16進数表記にする
				setRadix(h ? 16 : 10);
			},
			setColorPicker: f => {
				$('front-color').addEventListener('click', f, false);
			},
			orderColor: data => {
				// 未使用色の削除
				cells.forEach((e, i) => {
					e.style.backgroundColor = palette[i];
				});
			}
		};
	}(document);

	// スピンボタン
	const Spin = function() {
		let down = false,
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
			let val = parseInt(target.value, radix),
				newVal = isNaN(val) ? min : range(val + step, min, max);
			if(newVal !== val) {
				target.value = newVal.toString(radix).toUpperCase();

				if(onchange) {
					onchange();
				}
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
				setTimeout(() => {
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
		
		return (elm, f) => {
			onchange = f;
			$.bind(elm, 'mousedown', mousedownHandler);
			$.bind(elm, 'mouseup', mouseupHandler);
			$.bind(elm, 'mouseout', mouseoutHandler);
		};
	}();
	
	// スライダー
	const Slider = function() {
		let down = false,
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
		
		return (e, f) => {
			change = f;
			target = e;
			length = e.offsetWidth,
			cursor = target.firstChild;
			$.bind(target, 'mousedown', mousedownHandler);
			
			return {
				value: value,
				position: x => {
					this.value = x / length;
				}
			};
		};
	}();

	global.Palette = Palette;
	
})(this, Selector, Color);
