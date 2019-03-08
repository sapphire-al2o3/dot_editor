/*
 * KeyMapper
 *
 */

var KeyMapper = (function () {
	'use strict';
	var keymap = {},
		active = false,
		keyEvent = null;
	
	function getKeyCode(key, option) {
		var op = option ? [
			option[0] ? 'Ctrl+' : '',
			option[1] ? 'Alt+' : '',
			option[2] ? 'Shift+' : ''
		].join('') : '';
		return op + String.fromCharCode(key).toUpperCase();
	}
	
	return {
		assign: function (key, func) {
			keymap[key] = func;
			return this;
		},
		assigns: function (keys) {
			var i = 0,
				l = keys.length;
			for (i = 0; i < l; i += 1) {
				this.assign(keys[i].key, keys[i].func);
			}
		},
		remove: function (key) {
			delete keymap[key];
		},
		invoke: function (key) {
			if (keymap.hasOwnProperty(key)) {
				keymap[key](key);
				return true;
			}
			return false;
		},
		bind: function (target, event) {
			var that = this;
			event = event || 'up';
			keyEvent = keyEvent || function (e) {
				if (e.target.tagName !== 'INPUT') {
					var key = getKeyCode(e.keyCode, [e.ctrlKey, e.altKey, e.shiftKey]);
					if (that.invoke(key)) {
						e.preventDefault();
						e.stopPropagation();
					}
				}
			};
			target.addEventListener('key' + event, keyEvent, false);
			return this;
		},
		unbind: function (target, event) {
			event = event || 'up';
			target.removeEventListener('key' + event, keyEvent, false);
		},
		getKeyCode: function (key, option) {
			return getKeyCode(key, option);
		},
		LEFT: String.fromCharCode(37),
		UP: String.fromCharCode(38),
		RIGHT: String.fromCharCode(39),
		DOWN: String.fromCharCode(40)
	};
}());
