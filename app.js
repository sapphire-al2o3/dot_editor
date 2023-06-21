
/**
 * Module dependencies.
 */
'use strict';
const express = require('express');
const http = require('http');
const path = require('path');
// const fs = require('fs');
const PNG = require('pngjs').PNG;
const request = require('request');
const imageUtils = require('./imagescaling.js');
const scaling = imageUtils.scaling;
const frame = imageUtils.frame;
const tiling = imageUtils.tiling;
const bitDepth4 = imageUtils.bitDepth4;
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const app = express();
const passport = require('passport');
// const { response } = require('express');
const TwitterStrategy = require('passport-twitter').Strategy;

const DISABLE_TWEET = process.env.DISABLE_TWEET;
let CONSUMER_KEY = process.env.CONSUMER_KEY;
let CONSUMER_SECRET = process.env.CONSUMER_SECRET;

if (CONSUMER_KEY === undefined || CONSUMER_SECRET === undefined) {
	const config = require('./config.json');
	CONSUMER_KEY = config.consumerKey;
	CONSUMER_SECRET = config.consumerSecret;
}

// Passport sessionのセットアップ
passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

// PassportでTwitterStrategyを使うための設定
passport.use(new TwitterStrategy({
	consumerKey: CONSUMER_KEY,
	consumerSecret: CONSUMER_SECRET,
	callbackURL: '/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
	profile.twitter_token = token;
	profile.twitter_token_secret = tokenSecret;
	
	process.nextTick(() => {
		return done(null, profile);
	});
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('trust proxy', 'loopback');
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(cookieParser('madomado'));

// セッション情報をファイルに保存する
let store;
if (process.env.USE_FILE_SESSION == 1) {
	const FileStore = require('session-file-store')(session);
	const fileStoreOptions = {
		path: process.env.FILE_SESSION_PATH ?? './sessions'
	};
	store = new FileStore(fileStoreOptions);
}

if (process.env.USE_DYNAMODB_SESSION == 1) {
	console.log(`table:${process.env.CYCLIC_DB}`);
	console.log(`key:${process.env.AWS_ACCESS_KEY_ID}`);
	console.log(`region:${process.env.AWS_REGION}`);
	const DynamoDBStore = require('connect-dynamodb')({session: session});
	const dynamoDBStoreOptions = {
		table: process.env.CYCLIC_DB,
		// AWSConfigJSON: {
		// 	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		// 	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		// 	region: process.env.AWS_REGION
		// },
		reapInterval: 24 * 60* 60 * 1000
	};
	store = new DynamoDBStore(dynamoDBStoreOptions);
	console.log('DynamoDBStore');
}

app.use(session({
	store: store,
	secret: 'homuhomu',
	cookie: { maxAge: 60 * 60 * 1000 },
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

// 404
app.use((err, req, res, next) => {
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
app.get('/auth/twitter', (req, res) => {
	if (!DISABLE_TWEET && !req.user) {
		passport.authenticate('twitter')(req, res);
	} else {
		// 認証済み
		res.redirect('/post.html');
	}
});

app.get('/auth', (req, res) => {
	res.contentType('application/json');
	res.send(JSON.stringify({twitter: !req.user}));
});

function createPNG(image) {
	const paletteData = Buffer.from(image.palette, 'base64');
	const scale = image.scale ?? 1;
	const depth = image.depth ?? 8;

	// 拡大する
	let indexData = scaling(Buffer.from(image.index, 'base64'), image.width, image.height, scale);
	image.width *= scale;
	image.height *= scale;

	// 余白をつける
	if (image.space) {
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

	if (depth === 4) {
		indexData = bitDepth4(indexData);
	}

	let img = new PNG({
		width: image.width,
		height: image.height,
		colorType: 3,
		filterType: 0,
		bitDepth: depth
	});

	img.data = indexData;
	img.palette = paletteData;
	
	// 透明色指定
	if (image.transparent !== undefined && image.transparent < 256) {
		const trns = Buffer.allocUnsafe(paletteData.length / 3 ^ 0);
		trns.fill(255);
		trns[image.transparent] = 0;
		img.transparency = trns;
	}

	return img;
}

app.post('/auth/twitter/post', (req, res) => {
	let text = req.body.text,
		image = JSON.parse(req.body.image);

	if (DISABLE_TWEET) {
		res.redirect('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text));
	} else if(req.user && image) {
		const img = createPNG(image);

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
			// console.log(response);
			res.redirect('/success.html');
		});

		// const options = {
		// 	method: 'POST',
		// 	headers: headers
		// };
		// const r = https.request(url, options, response => {
		// 	console.log(response.statusCode);
		// 	res.redirect('/success.html');
		// });
		
		// const form = new FormData();
		// form.append('status', text);
		// form.append('media[]', img.packSync());

		// form.pipe(r);

		// r.on('error', e => {
		// 	console.log(error);
		// });

		const form = r.form();
		form.append('status', text);
		// form.append('media[]', img.pack2());
		form.append('media[]', img.packSync());
		console.log('ok');
		
	} else {
		console.log(`ng user:${req.user} image:${image}`);
		res.redirect('/auth/twitter');
	}
});

// コールバック
const callback = passport.authenticate('twitter', {
	successRedirect: '/post.html',
	failureRedirect: '/'
});
app.get('/auth/twitter/callback', (req, res) => {
	callback(req, res);
});

app.get('/post', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/post.html'));
});

app.post('/download', (req, res) => {
	const image = JSON.parse(req.body.image);
	if (image) {
		const img = createPNG(image);
		res.set('Content-disposition', 'attachment; filename=download.png');
		res.set('Content-Type', 'image/png;');
		res.send(img.packSync());
	}
});

http.createServer(app).listen(app.get('port'), () => {
	console.log('Express server listening on port ' + app.get('port'));
});
