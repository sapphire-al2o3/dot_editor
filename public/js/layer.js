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
	
	var Layer = function (w, h) {
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
	
	Layer.add = function(w, h) {
		var layer = {
			width: w,
			height: h,
			indexData: createIndexData(w, h)
		};
		layer.canvas = document.createElement('canvas');
		layer.canvas.width = w;
		layer.canvas.height = h;
		layer.canvas.setAttribute('id', 'layer-' + this.count);
		layer.canvas.setAttribute('z-index', 1);
		layer.ctx = layer.canvas.getContext('2d');
		
		layers.push(layer);
		$('editer-canvas').appendChild(layer.canvas);
		
		this.count++;
	};
	
	//! @brief レイヤーの削除
	Layer.remove = function(index) {
		var layer = layers[index];
		$('editer-canvas').removeChild(layer.canvas);
		layers.splice(index, 1);
	};
	
	Layer.count = 0;
	
	var LayerRenderer = {};
	LayerRenderer.render = function (layer, option) {
		drawIndexedImage(layer.ctx, layer.indexData, layer.palette, option);
	};
	
	global.Layer = Layer;
	
})(this, Selector);

