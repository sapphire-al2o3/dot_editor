/*

アニメーション制御

モデル
・1フレーム
・全フレーム

ビュー
・時間管理
・描画管理
	・表示(canvas)
	・DOM
*/

(function(global) {
	'use strict';
	
	function AnimationFrame() {
		return {
			region: rect(0, 0, 32, 32),
			layer: null,
			delay: 200
		};
	}
	
	function animationFrame(x, y, w, h, delay) {
		return {
			region: {
				x: x,
				y: y,
				w: w,
				h: h
			},
			layer: null,
			delay: delay || 200
		};
	}
	
	function AnimationView() {
		this.frames = [];
		this.current = 0;
		this.end = 0;
		this.begin = 0;
		this.timer = 0;
	}
	
	AnimationView.prototype.addFrame = function(frame) {
		this.frames.push(frame);
	};
	
	AnimationView.prototype.removeFrame = function(index) {
		this.frames.splice(index, 1);
	};
	
	AnimationView.prototype.next = function() {
		this.current++;
		if(this.current >= this.frames.legth) this.current = 0;
	};
	
	AnimationView.prototype.prev = function() {
		this.current--;
		if(this.current < 0) this.current = this.frames.length - 1;
	};
	
	AnimationView.prototype.play = function() {
		this.timer = setTimeout(this.render.bind(this), 1);
	};
	
	AnimationView.prototype.render = function() {
		var f = this.frames[this.current];
		this.draw(f);
		this.current++;
		if(this.current >= this.frames.length) this.current = 0;
		this.timer = setTimeout(this.render.bind(this), f.delay);
	};
	
	AnimationView.prototype.stop = function() {
		clearTimeout(this.timer);
	};
	
	global.AnimationView = AnimationView;
	
}(this));
