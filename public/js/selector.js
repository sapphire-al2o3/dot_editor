/*
 * シンプルなDOMのセレクターを定義する
 */
(function(global, document) {
	'use strict';
	
	function $(e) {
		return document.getElementById(e);
	}
	
	function $q(e, p) {
		return p ? p.querySelector(e) : document.querySelector(e);
	}
	
	function $qa(e, p) {
		return p ? p.querySelectorAll(e) : document.querySelectorAll(e);
	}
	
	$.show = e => {
		e.style.display = 'block';
	};
	
	$.hide = e => {
		e.style.display = 'none';
	};
	
	$.toggle = e => {
		e.style.display !== 'none' ? $.hide(e) : $.show(e);
	};
	
	$.position = (e, x, y) => {
		e.style.left = x + 'px';
		e.style.top = y + 'px';
	};
	
	$.size = (e, w, h) => {
		e.style.width = w + 'px';
		e.style.height = h + 'px';
	};
	
	$.bind = (e, event, func) => {
		if(typeof e === 'string') {
			func = event;
			event = e;
			e = document;
		}
		e.addEventListener(event, func, false);
	};
	
	$.unbind = (e, event, func) => {
		if(typeof e === 'string') {
			func = event;
			event = e;
			e = document;
		}
		e.removeEventListener(event, func, false);
	};
	
	function fadeOutEnd(e) {
		e.target.style.display = 'none';
		$.unbind(e.target, 'transitionend', fadeOutEnd);
	}
	
	$.fadeOut = e => {
		e.style['transition'] = 'opacity 0.6s ease';
		e.style['opacity'] = '0.0';
		$.bind(e, 'transitionend', fadeOutEnd);
	};
	
	$.fadeIn = e => {
		e.style['transition'] = 'opacity 0.6s ease';
		e.style['opacity'] = '1.0';
		e.style.display = 'block';
	};
	
	$.d = document;
	$.q = $q;
	$.qa = $qa;
	
//	global.$ = $;
	global.$q = $q;
	global.$qa = $qa;
	global.Selector = $;
	
})(this, document);
