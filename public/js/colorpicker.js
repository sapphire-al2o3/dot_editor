/*
 * Color Picker
 *
 * require('color.js');
 * require('selector.js');
 *
 */
(function(global, $, Color) {
	'use strict';
	
	let h = 0,
		s = 0,
		v = 0,
		color = [],
		hueCursor,
		colorCursor,
		down = false,
		rect,
		elm,
		change,
		label;
	
	function range(v, min, max) {
		return v < min ? min : v > max ? max : v;
	}
	
	function setText() {
		label[0].textContent = 'H:' + h;
		label[1].textContent = 'S:' + (s * 100 ^ 0) + '%';
		label[2].textContent = 'V:' + (v * 100 ^ 0) + '%';
	}
	
	function moveHue(e) {
		if (down) {
			let y = e.clientY - rect.top;
			y = range(y, 0, 128);
			hueCursor.style.top = (y - 1) + 'px';

			h = (y - 1) / 128 * 360 ^ 0;
			h = range(h, 0, 360);
			$('color').style.backgroundColor = 'hsl(' + h + ',100%,50%)';
			setText();
		}
		e.preventDefault();
	}
	function upHue(e) {
		down = false;
		color = Color.hsv(h, s, v);
		change && change(color);
		$.unbind('mousemove', moveHue);
		$.unbind('mouseup', upHue);
	}
	
	function downHue(e) {
		const target = e.currentTarget;
		rect = target.getBoundingClientRect();
		let y = e.clientY - rect.top;
		y = range(y, 0, 128);
		hueCursor.style.top = (y - 1) + 'px';
		h = (y - 1) / 128 * 360 ^ 0;
		if(h < 0) h = 0;
		if(h > 360) h = 360;
		$('color').style.backgroundColor = 'hsl(' + h + ',100%,50%)';
		down = true;
		setText();
		color = Color.hsv(h, s, v);
		change && change(color);
		$.bind('mousemove', moveHue);
		$.bind('mouseup', upHue);
		e.preventDefault();
	}
	
	function downColor(e) {
		const target = e.currentTarget;
		rect = target.getBoundingClientRect();
		let x = e.clientX - rect.left,
			y = e.clientY - rect.top;
		x = range(x, 0, 127);
		y = range(y, 0, 127);
		v = x / 127;
		s = 1 - y / 127;
		colorCursor.style['left'] = x + 'px';
		colorCursor.style['top'] = y + 'px';
		color = Color.hsv(h, s, v);
		change && change(color);
		$.bind('mousemove', moveColor);
		$.bind('mouseup', upColor);
		down = true;
		setText();
		e.preventDefault();
		return false;
	}
	
	function moveColor(e) {
		if(down) {
			let x = e.clientX - rect.left,
				y = e.clientY - rect.top;
			x = range(x, 0, 128);
			y = range(y, 0, 128);
			colorCursor.style['left'] = x + 'px';
			colorCursor.style['top'] = y + 'px';
			v = x / 127;
			s = 1 - y / 127;
			color = Color.hsv(h, s, v);
			setText();
		}
		e.preventDefault();
		return false;
	}
	
	function upColor(e) {
		change && change(color);
		down = false;
		$.unbind('mousemove', moveColor);
		$.unbind('mouseup', upColor);
	}
	
	function ColorPicker(e, event) {
		elm = $(e);
		change = event;
		colorCursor = $('color-picker-cursor');
		hueCursor = $('hue-cursor');
		label = $.qa('form label', elm);
		$('hue').addEventListener('mousedown', downHue);
		$('color-picker-map').addEventListener('mousedown', downColor, false);
	}
	
	ColorPicker.setColor = (color) => {
		if(elm.style.display === 'none') {
			return;
		}
		
		const hsv = Color.rgb2hsv(color[0], color[1], color[2]);
		h = hsv[0];
		s = hsv[1];
		v = hsv[2];
		$('color').style.backgroundColor = 'hsl(' + h + ',100%,50%)';
		hueCursor.style.top = h * 128 / 360 - 1 + 'px';
		colorCursor.style['top'] = ((1 - s) * 127) + 'px';
		colorCursor.style['left'] = (v * 127) + 'px';
		setText();
	};
	
	global.ColorPicker = ColorPicker;
	
})(this, Selector, Color);
