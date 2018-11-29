/*

Layer

Model
・visiblity
・Index Data
・Palette Data
・transpalent index
・Dom

*/

(function (global, $) {
	'use strict';
	
	var document = $.d;
	
	var Layer = function(w, h) {
		this.width = w;
		this.height = h;
		this.canvas = document.createElement('canvas');
		this.canvas.width = w;
		this.canvas.height = h;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.setAttribute('id', 'layer-' + Layer.count++);
		this.canvas.setAttribute('z-index', 1);
		this.indexData = this.ctx.createImageData(w, h);
		
		document.getElementById('editor-canvas').appendChild(this.canvas);
	};
	
	var layers = [];
	
	var parent = document.getElementById('editor-canvas');
	let uid = 0;
	
	Layer.add = function(w, h) {
		let layer = {
			width: w,
			height: h,
			indexData: createIndexData(w, h),
			transparent: 0,
			visibility: true,
			index: uid
		};
		layer.canvas = document.createElement('canvas');
		layer.canvas.setAttribute('id', 'layer-' + uid);
		layer.canvas.setAttribute('z-index', layers.length + 1);
		layer.canvas.classList.add('layer-canvas');
		layer.ctx = layer.canvas.getContext('2d');
		
		layers.push(layer);
		uid++;
		return layer;
	};
	
	//! @brief レイヤーの削除
	Layer.remove = function(index) {
		let layer = layers[index];
		$('editor-canvas').removeChild(layer.canvas);
		layers.splice(index, 1);
	};
	
	// レイヤーを上に移動する
	Layer.up = function(index) {
		if(index <= 0) return;
		let t = layers[index - 1];
		layers[index - 1] = layers[index];
		layers[index] = t;
		layers[index].canvas.setAttribute('z-index', index + 1);
		layers[index - 1].canvas.setAttribute('z-index', index);
	};
	
	Layer.down = function(index) {
		if(index >= layers.length) return;
		let t = layers[index - 1];
		layers[index + 1] = layers[index];
		layers[index] = t;
		layers[index].canvas.setAttribute('z-index', index + 1);
		layers[index + 1].canvas.setAttribute('z-index', index + 2);
	};
	
	Layer.get = function(index) {
		return layers[index];
	};
	
	Layer.count = function() {
		return layers.length;
	};
	
	var LayerRenderer = {};
	LayerRenderer.render = function (layer, option) {
		drawIndexedImage(layer.ctx, layer.indexData, layer.palette, option);
	};
	
	global.Layer = Layer;
	
})(this, Selector);

