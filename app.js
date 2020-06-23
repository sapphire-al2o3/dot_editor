
/**
 * Module dependencies.
 */

'use strict';

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var PNG = require('pngjs').PNG;
var request = require('request');
const scaling = require('./imagescaling.js').scaling;
const frame = require('./imagescaling.js').frame;
const tiling = require('./imagescaling.js').tiling;
var config = require('./config');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var morgan = require('morgan');

var app = express();

var passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy;

var CONSUMER_KEY = config.consumerKey,
	CONSUMER_SECRET = config.consumerSecret;

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
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(cookieParser('madomado'));
app.use(session({secret: 'homuhomu', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// 404
app.use(function(err, req, res, next) {
	console.log(err);
	res.status(404);
	res.redirect('/404.html');
});

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
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
	let text = req.body.text,
		image = JSON.parse(req.body.image);
	if(req.user && image) {
		let scale = req.body.scale ? parseInt(req.body.scale, 10) : 1,
			paletteData = Buffer.from(image.palette, 'base64');
		
		// 拡大する
		let indexData = scaling(Buffer.from(image.index, 'base64'), image.width, image.height, scale);
		image.width *= scale;
		image.height *= scale;
		
		// 余白をつける
		if(image.space) {
			const frameWidth = image.frameWidth;
			const frameeHeight = image.frameHeight;
			if(image.tiling) {
				indexData = tiling(indexData, image.width, image.height, frameWidth, frameeHeight);
			} else {
				indexData = frame(indexData, image.width, image.height, frameWidth, frameeHeight);
			}
			image.width = frameWidth;
			image.height = frameeHeight;
		}

		let img = new PNG({
			width: image.width,
			height: image.height,
			colorType: 3,
			filterType: 0,
		});
		
		img.data = indexData;
		img.palette = paletteData;
		if(image.transparent !== undefined && image.transparent < 256) {
			let trns = [];
			for(var i = 0; i < paletteData.length / 3; i++) {
				trns.push(255);
			}
			trns[image.transparent] = 0;
			img.transparency = Buffer.from(trns);
		}

		// img.pack2().pipe(fs.createWriteStream('./uploads/out.png'));
		// res.redirect('/success.html');
		// return;
		
		const url = 'https://api.twitter.com/1.1/statuses/update_with_media.json';
		// const url = 'https://api.twitter.com/1.1/statuses/update.json';
		
		const orderedParameters = passport._strategies.twitter._oauth._prepareParameters(
			req.user.twitter_token,
			req.user.twitter_token_secret,
			'POST',
			url
		);
		
		const headers = { authorization: passport._strategies.twitter._oauth._buildAuthorizationHeaders(orderedParameters) };
		const r = request.post({url: url, headers: headers }, (err, data, response) => {
			if(err) {
				console.log(err);
				res.redirect('/failure.html');
				return;
			}
			console.log(response);
			res.redirect('/success.html');
		});
		
		var form = r.form();
		
		form.append('status', text);
		// form.append('media[]', img.pack2());
		form.append('media[]', img.packSync());
		console.log('ok');
		
	} else {
		console.log('ng');
		res.redirect('/auth/twitter');
	}
});

// コールバック
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect: '/post.html',
	failureRedirect: '/'
}));

app.get('/post', (req, res) => {
	res.sendfile(path.join(__dirname, 'public/post.html'));
});

http.createServer(app).listen(app.get('port'), () => {
	console.log('Express server listening on port ' + app.get('port'));
});
