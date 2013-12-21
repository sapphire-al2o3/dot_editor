
/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', { title: 'Express' });
};

/*

var Twitter = require('ntwitter'),
	oauth = require('oauth'),
	config = require('../config');

var client = new oauth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	config.consumerKey,
	config.consumerSecret,
	'1.0',
	'callback url',
	'HMAC-SHA1'
);

var twitter = new Twitter({
	
});

exports.tweet = function(req, res) {
	console.log(req.files);
	console.log('/tweet');
	console.log(req.body);
	
	client.getOAuthRequestToken(function(err, token, secret, results) {
		if(err) {
			console.log(err);
		}
		
		
	});
};
*/