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
	
	$.show = function(e) {
		e.style.display = 'block';
	};
	
	$.hide = function(e) {
		e.style.display = 'none';
	};
	
	$.position = function(e, x, y) {
		e.style.left = x + 'px';
		e.style.top = y + 'px';
	};
	
	$.size = function(e, w, h) {
		e.style.width = w + 'px';
		e.style.height = h + 'px';
	};
	
	$.bind = function(e, event, func) {
		if(typeof e === 'string') {
			e = document;
			func = event;
		}
		e.addEventListener(event, func, false);
	};
	
	$.unbind = function(e, event, func) {
		if(typeof e === 'string') {
			e = document;
			func = event;
		}
		e.removeEventListener(event, func, false);
	};
	
	$.d = document;
	$.q = $q;
	$.qa = $qa;
	
//	global.$ = $;
	global.$q = $q;
	global.$qa = $qa;
	global.Selector = $;
	
})(this, document);
