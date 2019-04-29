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
	Storage.save = (key, data) => {
		if(localStorage) {
			localStorage.setItem(key, data);
		}
	};
	
	// 読み込む
	Storage.load = (key) => {
		if(localStorage) {
			return localStorage.getItem(key);
		}
	};
	
	global.Storage = Storage;
	
})(this);
