/*
 * command history
 *
 */

(function(global) {
	'use strict';
	
	const History = function() {
		var stack = [],
			capacity = 20;
		return {
			undo: () => {
				return stack.pop();
			},
			record: (command, value) => {
				stack.push({command, value});
			}
		};
	}();
	
	global.History = History;
	
})(this);
