/*

サーバへの画像データの送信テスト
送信するデータ
・インデックスデータ(index-data)
・パレットデータ(palette-data)

レイヤー構造
・ワークレイヤー
・描画レイヤー

to do
・グリッド表示(グリッドをどのレイヤーに描くか)(完了)
・パレットの表示(完了)
・ツールチップの表示(CSSアニメーションで表示)(完了)
・ツールバーを上に配置(完了)
・画像の投稿(完了)
・塗りつぶし長方形ツール(完了)
・パレットの初期位置設定(完了)
・キャンバスのサイズ指定(完了)
・塗りつぶし楕円ツール(完了)
・等倍表示ウィンドウ(完了)
・倍率の表示(完了)
・ショートカットキー(Alt)＋クリックでスポイト(完了)
・画面を閉じるときにアラート(完了)
・HSVの色選択(完了)
・描画時に連続データを一つの長方形にして描画負荷軽減(完了)
・矩形での範囲選択(完了)
・コピー、切り取り、貼り付け、移動
・選択範囲の拡大、縮小時の動作、グリッド対応
・大グリッド表示(完了)
・DOMに関係しているところとエディタ機能の部分を切り離す
・デバッグ用にファイルからの読み込み(完了)
・スポイトツール(完了)
	・1回選択したら前に使用していたツールに戻す
・画面遷移(完了)

・画面レイアウトの変更
・初期化処理の整理
・パレット周りのデータ構造の整理
・抜き色、透明色の扱い
・ツールアイコンの整理
・Undo
・Redo
・レイヤー
・キーコンフィグ
・オプション
	・グリッド
・環境データの保存
・ペンの太さ変更
・画像のスクロール(Shift + マウスドラッグ)
・アニメーション
・キャンバスの外からの選択範囲の開始

・使用しているパレットインデックスの最大値に応じて再描画の負荷を減らす
・既存の絵の編集
・サーバ連携部分の分離
・スクリプトのミニファイ
・画像のアトラス化
・選択ツールでクリックした時に1ドット選択にする

bug
・グリッドオフにしたときに線が残る(fix)
・最初から選択されているツールの選択状態が解除されていない(fix)
・パレットの移動がパレットから外れるとキャンセルされる
・ツールで描画中にグリッドが指定倍数以下でも表示される(fix)
・初期状態のキャンバスサイズが拡大、縮小した場合と違う(fix)
・矩形、直線ツールで座標がオーバーしている(fix)
・再描画したときにパレット総数を反映していない(fix)
・画面サイズを変えたときにマウスの座標が合っていない(fix)
・Undoしたときにプレビューウィンドウが更新されない(fix)
・塗りつぶし円が横にはみ出した時に回りこむ(fix)
・円が横にはみ出した時に回りこむ(fix)
・回転すると画像がずれる(fix)
・ツールをキャンセルしたときにグリッドが消える(fix)
・右端からペンで線を描いたときに左端に1ドット描画される(fix)
・円が表示されない(fix)
・パレットでドラッグしても色が変わっていない(fix)
・キーを押した時にdownだと複数回呼ばれてしまう(fix)
・キーでツールを切り替えてもボタンが選択状態にならない(fix)
・塗りつぶし円の真ん中が正しく塗りつぶされていない場合がある(fix)
・カラーピッカーを出すのに2回クリックしないといけない(fix)
・画像を読み込んだ時にグリッドが消える(fix)
・スクロールしてペンで描画すると位置がずれている(fix)

・細長い楕円の描画が途中で切れている
・拡大縮小、選択範囲などを使用した時にグリッドが等倍でも出てしまう
・選択範囲を回転するときに選択範囲の大きさが変わっていない
・プレビューウィンドウで右クリックすると下のキャンバスの色をスポイトしてしまう
・描画時にキャンバス外で右クリックしてもキャンセルされない
・HSVのカラー選択で表示される数値が変わっていない
・パレットに数値入力した時にキャンバスのサイズがおかしくなる
・楕円で(0, 0, 15, 15)の大きさで描画したときに円の形がおかしい
・スクロールしていると新規作成のフェードが画面全体にかからない

画面遷移
サイズ選択ダイアログ
→エディタ
→投稿ダイアログ
→ビューアページ

memo
・描画領域をブラウザ全体にしてしまうほうがいいかも
・ヘッダとフッタだけつけてその他のナビゲーションを排除
・パレットは右に固定
・選択範囲は一番上に置いておかないとドラッグできない

feedback
・色の指定を2次元の領域でしたい(HSVみたいな)
・ドラッグでカラーバーを変更
・カーソルの位置に何か出して欲しい
・パレットの初期色
・等倍表示ウィンドウ

editor: Editor
	layers[]: Layer
	activeLayer
	palette: Palette
	selection
	work
	context
	config
	keymap
	history

必要なモジュール
・color.js       Color
・palette.js     Palette
・colorpicker.js
・selection.js
・keymapper.js   KeyMapper
・base64.js      Base64
・canvas.js

必要なアイコン
・拡大
・縮小
・グリッド
・やり直し
・ペン
・直線
・矩形
・円
・塗りつぶし
・範囲選択
・コピー
・投稿

*/

(function(global, $) {
	'use strict';
	
	// サーバのURL
	var docId = 0,
		canvas,
		ctx,
		work,
		preview,
		selectionCtx,
		indexData,
		paletteData,
		palette,
		down = false,
		paletteIndex = 1,
		prevTool = 'pen',
		tool = 'pen',
		dropper = false,
		mode;
	
	var $grid = $('grid'),
		$selection = $('selection');
	
	var editor = {
		width: 64,
		height: 64
	};
	
	var points = [];
	var background = {
		position: 'middle',
		color: 'rgba(0, 0, 0, 1)',
		fit: true
	};
	var option = {};
	option.scales = [1, 2, 4, 6, 8, 12];
	option.zoom = 2;
	option.scale = option.scales[option.zoom];
	option.gridOn = false;
	option.grid = {
		color0: '#808080',
		color1: '#C0C0C0',
		size: 16,
		enable: false
	};
	
	var tempData = [];
	
	// 描画状態
	var context = {
		paletteIndex: 1,
		layers: [],
		tool: 'pen',
		prevTool: 'pen',
		dropper: false,
		down: false
	};
	// 選択範囲
	var selection = {
		region: { x: 0, y: 0, w: 0, h: 0 },
		enable: false,
		indexData: null,
		transparent: false
	};

	editor.context = context;
	editor.option = option;

	// プレビュー画像を描画する
	function drawPreview() {
		preview.canvas.width = indexData.width;
		preview.canvas.height = indexData.height;
		Palette.convert(paletteData);
		drawIndexedImageData(preview, indexData, paletteData, 1);
		return preview.canvas.toDataURL();
	}

	// キャンバスをリサイズする
	function resize() {
		canvas.width = indexData.width * option.scale;
		canvas.height = indexData.height * option.scale;
		option.canvasWidth = canvas.width;
		option.canvasHeight = canvas.height;
		work.canvas.width = canvas.width;
		work.canvas.height = canvas.height;
		if(selection.enable) {
		}
	}
	
	// 拡大
	function zoomIn() {
		deselect();
		console.time('zoomIn');
		option.zoom++;
		if(option.zoom >= option.scales.length) {
			option.zoom = option.scales.length - 1;
		} else {
			option.scale = option.scales[option.zoom];
			resize();
			drawIndexedImage(ctx, indexData, palette, option.scale, paletteData);
			grid();
		}
		console.timeEnd('zoomIn');
//		$('#zoomRate').text('x ' + option.scale);
	}

	// 縮小
	function zoomOut() {
		deselect();
		option.zoom--;
		if(option.zoom < 0) {
			option.zoom = 0;
		} else {
			option.scale = option.scales[option.zoom];
			resize();
			drawIndexedImage(ctx, indexData, palette, option.scale);
			grid();
		}
		console.log(option.zoom);
//		$('#zoomRate').text('x ' + option.scale);
	}

	// 等倍
	function zoomDefault() {
		option.zoom = 0;
		option.scale = option.scales[option.zoom];
		resize();
		drawIndexedImage(ctx, indexData, palette, option.scale);
//		$('#zoomRate').text('x ' + option.scale);
	}
	
	// グリッドの表示
	function grid() {
		if(option.gridOn && option.zoom > 2) {
			drawGrid(work, option, option.scale);
		}
	}
	
	// グリッドの表示切替
	function toggleGrid() {
		$grid.classList.toggle('selected');
		option.gridOn = !option.gridOn;
		option.imageWidth = indexData.width;
		if(option.gridOn) {
			grid();
		} else {
			work.clearRect(0, 0, work.canvas.width, work.canvas.height);
			// draw selection region
			// 選択範囲の再描画
		}
	}

	// 選択範囲の移動
	function moveSelection(ox, oy, x, y) {
		x = (x - ox + option.selection.region.x) * option.scale + 1;
		y = (option.selection.region.y) * option.scale + 1;
		$.position($selection, x, y);
	}
	
	// 垂直反転
	function flipVert() {
		if(selection.enable) {
			flipV(selectionCtx, selection.indexData);
		} else {
			record();
			flipV(ctx, indexData);
			drawPreview();
		}
	}
	
	// 水平反転
	function flipHorz() {
		if(selection.enable) {
			flipH(selectionCtx, selection.indexData);
		} else {
			record();
			flipH(ctx, indexData);
			drawPreview();
		}
	}
	
	// 回転
	function rotateRight() {
		if(selection.enable) {
			var w = selectionCtx.canvas.width,
				h = selectionCtx.canvas.height;
			// 長方形の選択範囲を回転させるには一旦別の領域にコピーしておかないと消えてしまう
			$.size($selection, selectionCtx.canvas.height, selectionCtx.canvas.width);
			selection.indexData = rotate90R(selectionCtx, selection.indexData);
			selection.region.w = selection.indexData.width;
			selection.region.h = selection.indexData.height;
		} else {
			record();
			rotate90R(ctx, indexData);
			drawPreview();
		}
	}
	
	function selectAll() {
		var r = selection.region;
		toggleTool('select')();
		$.position($selection, 0, 0);
		$.size($selection, ctx.canvas.width, ctx.canvas.height);
		r.x = 0;
		r.y = 0;
		r.w = indexData.width;
		r.h = indexData.height;
		selectHandler.enable = true;
		$.show($selection);
	}
	
	function shift(x, y) {
		record();
		if(x !== 0) shiftH(ctx, indexData, x, option.scale);
		if(y !== 0) shiftV(ctx, indexData, y, option.scale);
		drawPreview();
	}
	
	(function initialize() {
		
		function selectTool(t) {
			return function() { tool = t; };
		}
		
		// keymap登録
		var keymap = [
			{ key: 'Z', f: zoomIn, name: '拡大' },
			{ key: 'X', f: zoomOut, name: '縮小' },
			{ key: 'C', f: zoomDefault, name: '等倍' },
			{ key: 'P', f: selectTool('pen'), name: 'ペン' },
			{ key: 'L', f: selectTool('line'), name: '直線' },
			{ key: 'R', f: selectTool('rect'), name: '矩形' },
			{ key: 'F', f: selectTool('paint'), name: '塗りつぶし' },
			{ key: 'M', f: selectTool('select'), name: '範囲選択' },
			{ key: 'Shift+3', f: toggleGrid, name: 'グリッド' },
			{ key: 'Ctrl+Z', f: undo, name: '元に戻す' },
		];
		
		KeyMapper.assign('Z', zoomIn);
		KeyMapper.assign('X', zoomOut);
		KeyMapper.assign('C', zoomDefault);
		KeyMapper.assign('P', toggleTool('pen'));
		KeyMapper.assign('L', toggleTool('line'));
		KeyMapper.assign('F', toggleTool('paint'));
		KeyMapper.assign('R', toggleTool('rect'));
		KeyMapper.assign('Ctrl+Z', undo);
		KeyMapper.assign('Ctrl+Y', redo);
		KeyMapper.assign('M', toggleTool('select'));
		KeyMapper.assign('H', function() {
			shiftH(ctx, indexData, 1, option.scale);
		});
		KeyMapper.assign('V', function() {
			shiftV(ctx, indexData, 1, option.scale);
		});
		
		KeyMapper.assign('Ctrl+A', selectAll);
			
		// 選択範囲の解除
		KeyMapper.assign('Ctrl+D', deselect);
		KeyMapper.assign('Shift+3', toggleGrid);
		
		KeyMapper.assign('Ctrl+S', save);
		KeyMapper.assign('Ctrl+L', load);
		
		KeyMapper.assign('O', function() {
			tool = 'outline';
		});
		
		KeyMapper.bind(document, 'down');
	})();

	function createImage(w, h) {
		option.imageWidth = w;
		option.imageHeight = h;
		
		indexData = createIndexData(w, h);
		return indexData;
	}

	function initEditor() {
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		// ツール用のレイヤーを生成
		work = document.getElementById('work').getContext('2d');
		
		// 選択範囲のレイヤーを作成
		selectionCtx = document.getElementById('selection').getContext('2d');
		
		// パレットデータの作成
		paletteData = createPaletteData(256);
	}

	(function() {
		var hash = location.hash.slice(1),
			param = hash.split('=');
	
		if(param.length === 1) {
	
		} else {
			mode = param[0];
			docId = param[1];
			console.log(mode, docId);
		}
		
		initEditor();
	})();

	var activeTool,
		selectHandler;

	function toggleTool(t) {
		return function (e) {
			tool = t;
			activeTool && activeTool.classList.remove('selected');
			activeTool = $(t);
			activeTool.classList.add('selected');
			// 選択範囲解除
			if(tool !== 'select' && selectHandler.enable) {
				deselect();
				$.hide($selection);
			}
			dropper = false;
		};
	}


	(function() {
		if(typeof Palette !== 'undefined') {
			Palette.create('palette');
			Palette.setColorPicker(function (e) {
//				$('#color-picker').fadeToggle();
				$.toggle($('color-picker'));
			});
			ColorPicker('color-picker', function (c) {
				Palette.setColor(Color.rgb(c[0], c[1], c[2]));
			});
		}
		
		if(typeof Widget !== 'undefined') {
			new Widget('palette');
			new Widget('color-picker');
			new Widget('view');
			new Widget('layers');
			
			preview = $('view').lastChild.getContext('2d');
		}
	
		var usedPalette = {};
		function usePalette(index, color) {
			usedPalette[index] = color;
		}
		
		var left = canvas.getBoundingClientRect().left,
			top = canvas.getBoundingClientRect().top;
		
		$.position($('palette'), left + 420, top + 4);
		$.position($('view'), left + 420, top + 280);
		$.show($('overlay'));
		
		// ローカルファイルの読み込み
		FileLoader.onload = function(i, p) {
			deselect();
			indexData = i;
			paletteData = p;
			selection.indexData = createIndexData(indexData.width, indexData.height);
			Palette.setPaletteData(paletteData);
			Palette.setFrontColor(0);
			palette = Palette.getPaletteData();
			resize();
			drawIndexedImage(ctx, indexData, palette, option.scale);
			grid();
			drawPreview();
		};
		FileLoader.bind($('container'));
		
		activeTool = $('pen');
		
		// Tool
		$.bind($('zoomin'), 'click', zoomIn);
		$.bind($('zoomout'), 'click', zoomOut);
		$.bind($('grid'), 'click', toggleGrid);
		$.bind($('undo'), 'click', undo);
		$.bind($('paint'), 'click', toggleTool('paint'));
		$.bind($('pen'), 'click', toggleTool('pen'));
		$.bind($('line'), 'click', toggleTool('line'));
		$.bind($('rect'), 'click', toggleTool('rect'));
		$.bind($('frect'), 'click', toggleTool('frect'));
		$.bind($('ellipse'), 'click', toggleTool('ellipse'));
		$.bind($('fellipse'), 'click', toggleTool('fellipse'));
		$.bind($('select'), 'click', toggleTool('select'));
		$.bind($('copy'), 'click', paste);
		$.bind($('flipv'), 'click', flipVert);
		$.bind($('fliph'), 'click', flipHorz);
		$.bind($('rotater'), 'click', rotateRight);
		
		// スポイトツール
		$.bind($('dropper'), 'click', function() {
			prevTool = activeTool;
			activeTool && activeTool.classList.remove('selected');
			activeTool = $('dropper');
			activeTool.classList.add('selected');
			dropper = true;
		});
		
		$.bind($('twitter'), 'click', function(e) {
			window.open('/auth/twitter');
		});
		
		$.bind($('save'), 'click', save);
		$.bind($('load'), 'click', load);
		
		$.bind($('tools'), 'click', function(e) {
			$.toggle($('tools-2'));
			$('tools').classList.toggle('selected');
		});
		
		$.bind($('outline'), 'click', toggleTool('outline'));
		$.bind($('shiftl'), 'click', shift.bind(null, -1, 0));
		$.bind($('shiftr'), 'click', shift.bind(null, 1, 0));
		$.bind($('shiftu'), 'click', shift.bind(null, 0, -1));
		$.bind($('shiftd'), 'click', shift.bind(null, 0, 1));
		$.bind($('open-image'), 'click', function() {
			$('open-button').click();
		});
		
		$.bind($('open-button'), 'change', function(e) {
			FileLoader.load(e.target.files[0]);
			e.target.value = null;
		});
		
		// サイズの指定
		$.bind($('new-image-submit'), 'click', function(e) {
			$.hide($('new-image'));
//			$('#overlay').fadeOut();
			$.fadeOut($('overlay'));
			KeyMapper.bind(document);
			var index = parseInt($.q('#new-image input[name="size"]:checked').value, 10),
				size = [16, 32, 48, 64][index];
			createImage(size, size);
			selection.indexData = createIndexData(size, size);
			resize();
			ctx.fillStyle = palette[0];
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			drawPreview();
		});
	
		if(mode === 'fork' || mode === 'edit') {
			$.hide($('new-image'));

			load(docId, function(data) {
				$.hide($('loading'));
				Base64.decode(data.palette, paletteData.data);
				indexData = createIndexData(data.width, data.height);
				Base64.decode(data.index, indexData.data);

				palette = [];
				for(var i = 0, j = 0; i < paletteData.data.length; i++, j += 4) {
					palette.push(Color.rgb(paletteData.data[j], paletteData.data[j + 1], paletteData.data[j + 2]));
				}

				selection.indexData = createIndexData(data.width, data.height);
				Palette.setPaletteData(palette);
				resize();
				drawIndexedImage(ctx, indexData, palette, option.scale);
				drawPreview();
			});
		} else {
			palette = [
				'#FFF', '#000', '#F00', '#0F0', '#00F', '#FF0', '#F0F', '#0FF', '#888',
				'#F88', '#8F8', '#88F', '#FF8', '#8FF', '#F8F'
			];

			Palette.setPaletteData(palette);
			Palette.convert(paletteData);
			
			createImage(48, 48);
			selection.indexData = createIndexData(48, 48);
			resize();
			ctx.fillStyle = palette[0];
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			drawPreview();
//			$('#overlay').fadeIn();
			$.show($('overlay'));
		}
	
		Palette.change(function(e) {
			// パレットが変更された際のイベント
			drawIndexedImage(ctx, indexData, palette, option.scale);
			drawPreview();
		});
		Palette.setFrontColor(1);
		palette = Palette.getPaletteData();
		$.bind($('palette-opt'), 'click', function() {
			removeUnusedColor(indexData, palette);
			Palette.setPaletteData(palette);
		});
		
		$.bind($('work'), 'contextmenu', function(e) {
			if(down) {
				// 左クリック中
				down = false;
				work.clearRect(0, 0, work.canvas.width, work.canvas.height);
				grid();
			} else {
				var x = Math.floor((e.pageX - left) / option.scale),
					y = Math.floor((e.pageY - top) / option.scale);
				paletteIndex = indexData.data[(y * indexData.width + x)];
				Palette.setFrontColor(paletteIndex);
				ColorPicker.setColor(Color.str(Palette.getFrontColor()));
			}
			e.preventDefault();
			e.stopPropagation();
			return false;
		});
		
		// 範囲選択
		selectHandler = {
			enable: false,
			transparent: false,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			down: function(x, y) {
				var s = option.scale;
				this.x = x * s;
				this.y = y * s;
				this.w = canvas.width;
				this.h = canvas.height;
				
				if(this.enable) {
					deselect();
					this.enable = false;
				}
				
				selectionCtx.clearRect(0, 0, selectionCtx.canvas.width, selectionCtx.canvas.height);
				
				$.position($selection, this.x, this.y);
				$.hide($selection);
				selectionCtx.canvas.classList.remove('active');
				
			},
			move: function(x, y) {
				var s = option.scale,
					sx = this.x,
					sy = this.y;
				
				x = x * s;
				y = y * s;
				
				x = x < 0 ? 0 : x >= this.w ? this.w : x;
				y = y < 0 ? 0 : y >= this.h ? this.h : y;
				
				
				var w = Math.abs(x - sx),
					h = Math.abs(y - sy);
				
				x = sx > x ? x : sx;
				y = sy > y ? y : sy;

				if(w > 0 && h > 0) {
					$.position($selection, x, y);
					$.size($selection, w, h);
					$.show($selection);
				}
			},
			up: function(x, y) {
				var s = option.scale,
					r = selection.region;
				x = x * s;
				y = y * s;
				
				x = x < 0 ? 0 : x >= this.w ? this.w : x;
				y = y < 0 ? 0 : y >= this.h ? this.h : y;
				
				var w = Math.abs(x - this.x),
					h = Math.abs(y - this.y);
				
				x = this.x > x ? x : this.x;
				y = this.y > y ? y : this.y;
				
				r.x = x / s ^ 0;
				r.y = y / s ^ 0;
				r.w = w / s ^ 0;
				r.h = h / s ^ 0;

				selectionCtx.canvas.width = w;
				selectionCtx.canvas.height = h;
				$.size($selection, w, h);
				if(w > 0 && h > 0) {
					cut(this.transparent);
					this.enable = true;
					selection.transparent = this.transparent;
					selection.enable = true;
					selectionCtx.canvas.classList.add('active');
				}
			}
		};
		
		$.bind($('work'), 'mousedown', function(e) {
			var r = canvas.getBoundingClientRect();
			left = window.scrollX + r.left;
			top = window.scrollY + r.top;
			var x = e.pageX - left,
				y = e.pageY - top,
				size = option.scale;

			points = [y / size ^ 0, x / size ^ 0];

			if(e.altKey) {
				// スポイト
				paletteIndex = indexData.data[(points[0] * indexData.width + points[1])];
				Palette.setFrontColor(paletteIndex);
			} else if(dropper) {
				paletteIndex = indexData.data[(points[0] * indexData.width + points[1])];
				Palette.setFrontColor(paletteIndex);

				// ツールアイコンをもとに戻す
				if(dropper) {
					activeTool && activeTool.classList.remove('selected');
					activeTool = prevTool;
					activeTool.classList.add('selected');
					// 選択範囲解除
					if(tool !== 'select' && selectHandler.enable) {
						deselect();
						$.hide($selection);
					}
					dropper = false;
				}
			} else if(e.shiftKey) {
				// スクロール
			} else if(e.button === 0) {
				record();
				paletteIndex = Palette.getFrontIndex();
				ctx.fillStyle = Palette.getFrontColor();
				work.fillStyle = ctx.fillStyle;
				switch(tool) {
				case 'pen':
					down = true;
					drawDot(ctx, points[1], points[0], indexData, paletteIndex, option.scale);
					break;
				case 'paint':
					paint(ctx, points[1], points[0], indexData, paletteIndex, option.scale);
					break;
				case 'outline':
					drawOutline(ctx, points[1], points[0], indexData, paletteIndex, option.scale);
					break;
				case 'line':
				case 'rect':
				case 'frect':
					drawDot(work, points[1], points[0], null, paletteIndex, option.scale);
				case 'ellipse':
				case 'fellipse':
					down = true;
					break;
				case 'select':
				case 'move':
	//				if(option.selection.enable && rectIn(option.selection.region, x, y)) {
	//					tool = 'move';
	//				}
	//				down = true;
					selectHandler.transparent = e.ctrlKey;
					selectHandler.down(points[1], points[0]);
					down = true;
					break;
				default:
				}

				$.bind('mouseup', mouseupHandler);
				$.bind('mousemove', mousemoveHandler);
			} else if(e.button === 1) {
			}
			// Google Chromeで選択カーソルになるのを防ぐ
			e.preventDefault();
		});
		
		function mousemoveHandler(e) {
			if(down) {
				var size = option.scale,
					x = (e.pageX - left) / size ^ 0,
					y = (e.pageY - top) / size ^ 0,
					w = work.canvas.width,
					h = work.canvas.height,
					context = { palette: paletteIndex, option: option },
					dummy = { width: indexData.width, height: indexData.height };
				if(points[1] === x && points[0] === y) {
					return false;
				}
				work.clearRect(0, 0, w, h);
				switch(tool) {
				case 'pen':
					var px = points.pop(),
						py = points.pop();
					context.data = indexData.data;
					drawLine(ctx, px, py, x, y, indexData, paletteIndex, option.scale);
					points.push(y);
					points.push(x);
					break;
				case 'line':
					drawLine(work, points[1], points[0], x, y, dummy, paletteIndex, option.scale);
					break;
				case 'rect':
					drawRect(work, points[1], points[0], x, y, dummy, paletteIndex, option.scale);
					break;
				case 'frect':
					fillRect(work, points[1], points[0], x, y, dummy, paletteIndex, option.scale);
					break;
				case 'ellipse':
					drawEllipse(work, points[1], points[0], x, y, dummy, paletteIndex, option.scale);
					break;
				case 'fellipse':
					fillEllipse(work, points[1], points[0], x, y, dummy, paletteIndex, option.scale);
					break;
				case 'select':
					selectHandler.move(x, y, points[1], points[0]);
					break;
				}
				grid();
			}
			e.preventDefault();
			return false;
		};
		
		function mouseupHandler(e) {
			e.preventDefault();
			e.stopPropagation();
			if(e.button === 0 && down) {
				down = false;
				var size = option.scale,
					x = (e.pageX - left) / size ^ 0,
					y = (e.pageY - top) / size ^ 0;
				work.clearRect(0, 0, work.canvas.width, work.canvas.height);
				// 実際のレイヤーに描画する
				if(tool === 'line') {
					drawLine(ctx, points[1], points[0], x, y, indexData, paletteIndex, option.scale);
				} else if(tool === 'rect') {
					drawRect(ctx, points[1], points[0], x, y, indexData, paletteIndex, option.scale);
				} else if(tool === 'frect') {
					fillRect(ctx, points[1], points[0], x, y, indexData, paletteIndex, option.scale);
				} else if(tool === 'ellipse') {
					drawEllipse(ctx, points[1], points[0], x, y, indexData, paletteIndex, option.scale);
				} else if(tool === 'fellipse') {
					fillEllipse(ctx, points[1], points[0], x, y, indexData, paletteIndex, option.scale);
				} else if(tool === 'select') {
					selectHandler.up(x, y, points[1], points[0]);
				}
				grid();
			}
			
			$.unbind('mouseup', mouseupHandler);
			$.unbind('mousemove', mousemoveHandler);
			
			// 等倍ウィンドウの更新
			drawPreview();
			return false;
		}
	
		function mouseoutHandler(e) {
			down = false;
		}
	
		var offsetX, offsetY;
		$.bind($selection, 'mousedown', function(e) {
			var rect = e.target.getBoundingClientRect();
			left = e.target.offsetLeft;
			top = e.target.offsetTop;
			down = true;
			offsetX = e.pageX;
			offsetY = e.pageY;
			moveHandler.offsetX = e.pageX;
			moveHandler.offsetY = e.pageY;
			console.log(offsetX, offsetY, left, top);
			$.bind('mouseup', moveHandler.up);
			$.bind('mousemove', moveHandler.move);
			e.preventDefault();
		});
		
		var moveHandler = {
			offsetX: 0,
			offsetY: 0,
			left: 0,
			top: 0,
			down: function(e) {
				this.offsetX = e.pageX;
				this.offsetY = e.pageY;
			},
			move: function(e) {
				if(down) {
					e.preventDefault();
					e.stopPropagation();
					var s = option.scale,
						x = ((e.pageX - offsetX + left) / s ^ 0) * s,
						y = ((e.pageY - offsetY + top) / s ^ 0) * s;
					$.position($selection, x, y);
				}
				return false;
			},
			up: function(e) {
				if(down) {
					e.preventDefault();
					e.stopPropagation();
					var s = option.scale,
						x = ((e.pageX - offsetX + left) / s ^ 0),
						y = ((e.pageY - offsetY + top) / s ^ 0);
					
					selection.region.x = x;
					selection.region.y = y;
					
					$.unbind('mouseup', moveHandler.up);
					$.unbind('mousemove', moveHandler.move);
					
					down = false;
				}
			}
		};
		
		
		let $layerList = $('layer-list'),
			$currentLayer = $.q('#layer-list li');
		
		$.bind($('layer-list'), 'click', (e) => {
			if(e.target.localName === "li") {
				if($currentLayer) {
					$currentLayer.classList.remove('selected');
				}
				$currentLayer = e.target;
				$currentLayer.classList.add('selected');
			}
		});
		
		$.bind($layerList, 'change', (e) => {
			console.log(e.target.id);
		});
		
		$.bind($('layer-remove'), 'click', () => {
			console.log('remove layer');
			if($layerList.childElementCount > 1) {
				if($currentLayer) {
					let removeLayer = $currentLayer;
					
					if($currentLayer.nextElementSibling) {
						$currentLayer = $currentLayer.nextElementSibling;
					} else {
						$currentLayer = $currentLayer.previousElementSibling;
					}
					$currentLayer.classList.add('selected');
					$layerList.removeChild(removeLayer);
				}
			}
		});
		
		
		$.bind($('layer-add'), 'click', () => {
			console.log('add layer');
			let newLayer = $currentLayer.cloneNode(true);
//			$('layer-list').appendChild();
//			let newLayer = document.createElement('li');
			newLayer.lastChild.textContent = 'new レイヤー';
			newLayer.classList.remove('selected');
			$layerList.appendChild(newLayer);
//			Layer.add(canvas.width, canvas.height);
		});
		
		$.bind($('layer-up'), 'click', () => {
			if($currentLayer && $currentLayer.previousElementSibling) {
				$layerList.insertBefore($currentLayer, $currentLayer.previousElementSibling);
			}
		});
		
		$.bind($('layer-down'), 'click', () => {
			if($currentLayer && $currentLayer.nextElementSibling) {
				$layerList.insertBefore($currentLayer, $currentLayer.nextElementSibling.nextElementSibling);
			}
		});
	
		window.onbeforeunload = function(e) {
			return 'ページを移動すると編集した情報が失われます';
		};
	
	})();

	function saveFile() {
		var png = document.getElementById('canvas').toDataURL();
		//png = png.replace("image/png", "image/octet-stream");
		window.open(png, 'save');
	}

	// ローカルストレージに保存
	function save(name) {
		let json = JSON.stringify({
			indexData: Base64.encode(indexData.data),
			width: indexData.width,
			height: indexData.height,
			paletteData: Base64.encode(paletteData.data)
		});
		Storage.save({
			name: json
		});
		
		console.log('save');
	}

	// ローカルストレージから読み込み
	function load(name) {
		var result = Storage.load();
		
		if(result && result.indexData) {
			var w = parseInt(result.width, 10),
				h = parseInt(result.height, 10);
			deselect();
			indexData = createIndexData(w, h);
			Base64.decode(result.indexData, indexData.data);
			Base64.decode(result.paletteData, paletteData.data);
			selection.indexData = createIndexData(indexData.width, indexData.height);
			Palette.setPaletteData(paletteData);
			Palette.setFrontColor(0);
			palette = Palette.getPaletteData();
			resize();
			drawIndexedImage(ctx, indexData, palette, option.scale, paletteData);
			grid();
			drawPreview();
			console.log(indexData.width, indexData.height, palette.length, 'loaded');
		}
	}
	
	// 編集履歴を記録する
	// コマンドが確定した時点で呼び出す(コマンドがキャンセルされることがあるため)
	function record() {
		var back = tempData[tempData.length - 1];
		
		if(back) {
			var diff = diffIndexData(back.data, indexData.data);
		}
		
		var temp = createIndexData(indexData.width, indexData.height);
		
		copyRangeIndexData(indexData, temp);
		tempData.push(temp);
//		redo.length = 0;
	}
	
	// 取り消し
	function undo() {
		var temp = tempData.pop();
		
		if(temp) {
			copyRangeIndexData(temp, indexData);
			drawIndexedImage(ctx, indexData, palette, option.scale);
			drawPreview();
//			redo.push();
		}
	}

	// やり直し
	function redo() {
		var temp = redo.pop();
		
		if(temp) {
			copyRangeIndexData(temp.data, indexData.data);
			drawIndexedImage(ctx, indexData, palette, option.scale);
			
			tempData.push(temp);
		}
	}

	// 切り取り
	function cut(transparent) {
		var s = option.scale,
			r = selection.region,
			x = r.x * s,
			y = r.y * s,
			w = r.w * s,
			h = r.h * s;
		
		x = x < 0 ? 0 : x;
		y = y < 0 ? 0 : y;
		
		selectionCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
		
		ctx.fillStyle = palette[Palette.getBackIndex()];
		ctx.fillRect(r.x * s, r.y * s, r.w * s, r.h * s);
		selection.indexData.width = r.w;
		selection.indexData.height = r.h;
		copyIndexData(indexData, selection.indexData, r.x, r.y, r.w, r.h);
		fillIndexData(indexData, Palette.getBackIndex(), r.x, r.y, r.w, r.h);
		
//		drawIndexedImage(selectionCtx, selection.indexData, palette, option.scale);
		
//		if(option.gridOn && option.zoom > 2) {
//			drawGrid(selectionCtx, option, option.scale);
//		}
		
		if(transparent) {
			// 背景色を抜く
			drawClearColor(selectionCtx, selection.indexData, Palette.getBackIndex(), option.scale);
		}
	}
	
	// 選択解除
	function deselect() {
		if(!selection.enable) return;
		selection.enable = false;
		var s = option.scale,
			r = selection.region,
			x = r.x * s,
			y = r.y * s,
			transparentIndex = selection.transparent && Palette.getBackIndex();
		ctx.drawImage(selectionCtx.canvas, x, y);
		copyIndexData(selection.indexData, indexData, 0, 0, r.w, r.h, r.x, r.y, transparentIndex);
		$.hide($selection);
		
		drawPreview();
	}
	
	// 貼り付け
	function paste() {
		if(!selection.enable) return;
		
		deselect();
		$.position($selection, 0, 0);
		selection.region.x = 0;
		selection.region.y = 0;
		$.show($selection);
		selection.enable = true;
	}
	
	// 画面更新
	function refresh() {
		drawIndexedImage(ctx, indexData, palette, option);
	}

	// サブウィンドウから呼び出すための関数
	global.getImage = function() {
		Palette.convert(paletteData);
		return {
			indexData: indexData,
			paletteData: paletteData,
		};
	}

}(this, Selector));
