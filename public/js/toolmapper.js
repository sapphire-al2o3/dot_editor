/*
 *
 */
(function(global, $) {
	'use strict';
	
	var document = $.d;
	
	var ToolMapper = function() {
		var toolmap = {},
			tool = '',
			down = false,
			left = 0,
			top = 0,
			px = 0,
			py = 0,
			sx = 0,
			sy = 0;
		
		function move(e) {
			if(down && toolmap[tool] && toolmap[tool].move) {
				var x = e.pageX - left,
					y = e.pageY - top;
				
				e.preventDefault();
				
				toolmap[tool].move(x, y, px, py, e);
				px = x;
				py = y;
			}
		}
		
		function up(e) {
			if(down && toolmap[tool] && toolmap[tool].up) {
				var x = e.pageX - left,
					y = e.pageY - top;
				
				e.preventDefault();
				
				$.unbind('mousemove', move);
				$.unbind('mouseup', up);
				$.unbind('contextmenu', cancel);
				
				toolmap[tool].up(x, y, px, py, e);
			}
			down = false;
		}
		
		function cancel(e) {
			if(down && toolmap[tool] && toolmap[tool].cancel) {
				
				$.unbind('mousemove', move, false);
				$.unbind('mouseup', up, false);
				$.unbind('contextmenu', cancel);
				
				toolmap[tool].cancel(e);
			}
			down = false;
		}
		
		function downHandler(e) {
			if(toolmap[tool] && toolmap[tool].down) {
				var x = e.pageX - left,
					y = e.pageY - top;
				
				e.preventDefault();
				
				toolmap[tool].down(x, y, e);
				px = x;
				py = y;
				
				$.bind('mousemove', move);
				$.bind('mouseup', up);
				$.bind('contextmenu', cancel);
				down = true;
			}
		}
		
		return {
			assign: function(t, handler) {
				toolmap[t] = handler;
				tool = t;
				return this;
			},
			bind: function(target) {
				left = target.getBoundingClientRect().left;
				top = target.getBoundingClientRect().top;
				target.addEventListener('mousedown', downHandler, false);
				return this;
			},
			unbind: function(target) {
				target.removeEventListener('mousedown', downHandler, false);
			},
			setTool: function(t) {
				tool = t;
			}
		};
	}();
	
	global.ToolMapper = ToolMapper;

})(this, Selector);
