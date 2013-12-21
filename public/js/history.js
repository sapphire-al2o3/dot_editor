/*
 * command history
 *
 */

(function(global) {
	'use strict';
	
	var History = function() {
		var stack = [],
			capacity = 20;
		return {
			undo: function() {
				var command = stack.pop();
				return command;
			},
			record: function(command) {
				stack.push(command);
			}
		};
	}();
	
	global.History = History;
	
})(this);
