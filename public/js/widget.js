(function(global, $) {
	'use strict';
	
	var Widget = function (document) {
		
		var element = $(document),
			down = false,
			offsetX = 0,
			offsetY = 0,
			offset = {},
			w = 0,
			h = 0;
		
		return function(elm) {
			var that = this,
				mousemove = function (e) {
					if (down) {
						e.preventDefault();
						var x = e.pageX - offsetX + offset.left,
							y = e.pageY - offsetY + offset.top;
						$.position(elm, x, y);
					}
					return false;
				},
				mouseup = function (e) {
//					$(document).unbind('mouseup', mouseup);
//					$(document).unbind('mousemove', mousemove);
					document.removeEventListener('mouseup', mouseup, false);
					document.removeEventListener('mousemove', mousemove, false);
					down = false;
					that.target.classList.remove('widget-active');
					return false;
				};
			elm = $(elm);
			this.target = elm;
			this.x = 0;
			this.y = 0;
			
			/*
			elm.getElementsByTagName('p')[0].addEventListener('mousedown', function (e) {
				return false;
			}, false);
			*/
			
			$.q('p', elm).addEventListener('mousedown', function (e) {
				e.preventDefault();
				down = true;
				offset.left = e.target.getBoundingClientRect().left;
				offset.top = e.target.getBoundingClientRect().top;
				offsetX = e.pageX;
				offsetY = e.pageY;
				document.addEventListener('mousemove', mousemove, false);
				document.addEventListener('mouseup', mouseup, false);
				that.target.classList.add('widget-active');
				return false;
			}, false);
			
			
//			$.q('.close', elm).addEventListener('click', function () {
//				elm.fadeOut();
//			}, false);
		};
		
	}($.d);
	
	global.Widget = Widget;
	
})(this, Selector);
