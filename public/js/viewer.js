(function(global, $) {

	var Veiwer = {};
	
	if(global.Viewer) {
		global.Viewer = Viewer;
	}
	
	var zoom = 1,
		zoomMax = 8,
		element = $('viewer');
	
	Viewer.option = {
		canvas: null,
		active: false,
		imageWidth: 0,
		imageHeight: 0,
		canvasWidth: 0,
		canvasHeight: 0,
		grid: {
			on: false,
			color: '#AAA',
		},
	};
	
	/**
	 * 
	 */
	function zoomIn() {
		zoom = zoom >= zoomMax ? zoomMax : zoom + 1;
		
	}
	
	/**
	 * 
	 */
	function zoomOut() {
		zoom = zoom <= 1 ? 1 : zoom - 1;
	}
	
	KeyMapper.assign('x', zoomOut);
	
	global.addEventListener('keydown', onkeydown, false);
	
	var onkeydown = function(e) {
		if(active) {
			KeyMapper.invoke('x');
		}
	};

})(this, Selector);
