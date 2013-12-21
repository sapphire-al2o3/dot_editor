(function(global) {
	'use strict';
	
	var Utility = {
		rect: function (x0, y0, x1, y1) {
			var dx0 = Math.min(x0, x1),
				dy0 = Math.min(y0, y1),
				dx1 = Math.max(x0, x1),
				dy1 = Math.max(y0, y1);
			return { x: dx0, y: dy0, width: dx1 - dx0, height: dy1 - dy0 };
		},
		// 点が矩形に含まれるか判定
		rectIn: function (r, x, y) {
			return r.x <= x && r.x + r.width >= r.x && r.y <= y && r.y + r.height;
		},
		// 値を丸める
		round: function (x, r) {
			return (x / r ^ 0) * r;
		},
		//
		clamp: function (v, min, max) {
			return v > max ? max : v < min ? min : v;
		}
	};
	
	global.Utility = Utility;
	
})(this);
