/*
 * 通信周りの処理
 *
 */

var url = './json/';
function load(id, callback) {
	$.getJSON(url + id, {}, function(data) {
		callback(data);
	}).error(function(e) {
		console.log(e);
	});
}


function post(indexData, paletteData, option) {
	var json = {
		_index: Base64.encode(indexData.data, option.imageWidth * option.imageHeight),
		_palette: Base64.encode(paletteData.data),
		_image: $('#property img').get(0).src,
		width: option.imageWidth,
		height: option.imageHeight,
		title: $('#property-title').val(),
		name: $('#property-name').val(),
		comment: $('#property-comment').val()
	};
	$.post(url, { _doc: JSON.stringify(json) }, function (data) {
		location.href = './index.html';
		$('#property-submit').removeAttr('disabled');
		$('#property').hide();
		$('#overlay').hide();
		KeyMapper.bind(document);
	}, 'json').error(function () {
		console.log("error");
		$('#property-submit').removeAttr('disabled');
	});
}
