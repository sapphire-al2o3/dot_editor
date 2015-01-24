/*
 * ローカルへの保存
 */
(function(global) {
	'use strict';
	
	var Storage = {};
	
	// 削除する
	function clearSettings(option) {
		if(localStorage) {
			localStorage.clear();
		}
	}
	
	// 保存する
	Storage.save = function(items) {
		if(localStorage) {
			for(var i in items) {
				localStorage.setItem(i, items[i]);
			}
		}
	};
	
	// 読み込む
	Storage.load = function() {
		if(localStorage) {
			var result = {};
			for(var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				result[key] = localStorage.getItem(key);
			}
			return result;
		}
	};
	
	global.Storage = Storage;
	
})(this);
