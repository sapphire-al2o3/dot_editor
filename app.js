
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var PNG = require('pngjs').PNG;
var request = require('request');
var scaling = require('./imagescaling.js').scaling;

var app = express();

var passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy;

var CONSUMER_KEY = 'ktMyeOz1A3nk2S54RQQPA',
	CONSUMER_SECRET = 'WkhjhyFreraOlxyhLlrQw773U9wLnDTU37m0Y6u9ek';

// Passport sessionのセットアップ
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

// PassportでTwitterStrategyを使うための設定
passport.use(new TwitterStrategy({
	consumerKey: CONSUMER_KEY,
	consumerSecret: CONSUMER_SECRET,
	callbackURL: '/auth/twitter/callback'
}, function(token, tokenSecret, profile, done) {
	profile.twitter_token = token;
	profile.twitter_token_secret = tokenSecret;
	
	process.nextTick(function() {
		return done(null, profile);
	});
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.cookieParser('madomado'));
app.use(express.session({secret: 'homuhomu'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// 404
app.use(function(req, res, next) {
//  res.status(404);
//  res.render('404');
	res.redirect('/');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ルーティング
app.get('/', express.static(path.join(__dirname, 'public')));

// Twitterの認証
app.get('/auth/twitter', function(req, res) {
	if(!req.user) {
		passport.authenticate('twitter')(req, res);
	} else {
		// 認証済み
		res.redirect('/post.html');
	}
});

app.get('/auth', function(req, res) {
	res.contentType('application/json');
	res.send(JSON.stringify({twitter: !req.user}));
});

app.post('/auth/twitter/post', function(req, res) {
	var text = req.body.text,
		image = JSON.parse(req.body.image);
	
	if(req.user && image) {
		var scale = req.body.scale ? parseInt(req.body.scale, 10) : 1,
			paletteData = new Buffer(image.palette, 'base64');
		
		// 拡大する
		var indexData = scaling(new Buffer(image.index, 'base64'), image.width, image.height, scale);
		image.width *= scale;
		image.height *= scale;
		
		
		var img = new PNG({
			width: image.width,
			height: image.height,
			colorType: 3,
			filterType: 0,
		});
		
		img.data = indexData;
		img.palette = paletteData;
		if(image.transparent !== undefined) {
			var trns = [];
			for(var i = 0; i < paletteData.length / 3; i++) {
				trns.push(255);
			}
			trns[image.transparent] = 0;
			img.transparency = new Buffer(trns);
		}
//		img.pack().pipe(fs.createWriteStream('./uploads/out.png'));
		
		res.redirect('/success.html');
		
		var url = 'https://api.twitter.com/1.1/statuses/update_with_media.json';
		
		var orderedParameters = passport._strategies.twitter._oauth._prepareParameters(
			req.user.twitter_token,
			req.user.twitter_token_secret,
			'POST',
			url
		);
		
		var r = request.post(url, function(err, data, response) {
			if(err) {
//				console.log(err);
				res.redirect('/failure.html');
			}
			res.redirect('/success.html');
		});
		
		r.setHeaders({ authorization: passport._strategies.twitter._oauth._buildAuthorizationHeaders(orderedParameters) });
		var form = r.form();
		
		form.append('status', text);
		form.append('media[]', img.pack2());
//		console.log('ok');
		
	} else {
//		console.log('ng');
		res.redirect('/auth/twitter');
	}
});

// コールバック
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect: '/post.html',
	failureRedirect: '/'
}));

app.get('/post', function(req, res) {
	res.sendfile(path.join(__dirname, 'public/post.html'));
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
