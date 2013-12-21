/*
 * Color Picker
 *
 * require('color.js');
 * require('selector.js');
 *
 */
(function(global, $, Color) {
	'use strict';
	
	var document = $.d,
		h = 0,
		s = 0,
		v = 0,
		evt,
		color = [],
		hueCursor,
		colorCursor,
		down = false,
		rect,
		elm,
		change;
	
	function range(v, min, max) {
		return v < min ? min : v > max ? max : v;
	}
	
	function setText() {
		var text = $.qa('form label');
		text[0].textContent = 'H:' + h;
		text[1].textContent = 'S:' + ((1 - s) * 100 ^ 0) + '%';
		text[2].textContent = 'V:' + (v * 100 ^ 0) + '%';
	}
	
	function moveHue(e) {
//		var y = e.clientX - hueRect.left;
	}
	
	function downHue(e) {
		rect = e.target.getBoundingClientRect();
		var y = (e.offsetY || e.layerY);
		$('hue-cursor').style.top = y + 'px';
		h = (y - 1) / 128 * 360 ^ 0;
		if(h < 0) h = 0;
		if(h > 360) h = 360;
		$('color').style.backgroundColor = 'hsl(' + h + ',100%,50%)';
//		setText();
		color = Color.hsv(h, 1 - s, v);
		if(change) {
			change(color);
		}
	}
	
	function downColor(e) {
		var y = (e.offsetY || e.layerY) - 1,
			x = (e.offsetX || e.layerX) - 1;
		v = x / 127;
		s = y / 127;
		rect = e.target.getBoundingClientRect();
		colorCursor.style['left'] = x + 'px';
		colorCursor.style['top'] = y + 'px';
		color = Color.hsv(h, 1 - s, v);
		change && change(color);
		$.bind('mousemove', moveColor);
		$.bind('mouseup', upColorHandler);
		down = true;
//		setText();
		e.preventDefault();
		return false;
	}
	
	function moveColor(e) {
		if(down) {
			var x = e.clientX - rect.left,
				y = e.clientY - rect.top;
			x = range(x, 0, 128);
			y = range(y, 0, 128);
			colorCursor.style.left = x + 'px';
			colorCursor.style.top = y + 'px';
		}
		e.preventDefault();
		return false;
	}
	
	function upColorHandler(e) {
		down = false;
		$.unbind('mousemove', moveColor);
		$.unbind('mouseup', upColorHandler);
	}
	
	function ColorPicker(e, event) {
		elm = $(e);
		change = event;
		colorCursor = $('color-picker-cursor');
		$('hue').addEventListener('mousedown', downHue, false);
		$('color').addEventListener('mousedown', downColor, false);
	}
	
	ColorPicker.setColor = function(color) {
		
	};
	
	global.ColorPicker = ColorPicker;
	
})(this, Selector, Color);
