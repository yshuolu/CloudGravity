
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var Memcached = require('memcached')
var fs = require('fs');

var app = express();

//exports the app
exports = module.exports = app;

var env = process.env.NODE_ENV || 'development',
	config = require('./config/config')[env];

/**
 * Connect mongodb
 */

var connect = function(){
	var options = { server: { socketOptions: { keepAlive: 1 } }, user: 'app', pass: 'wenhui' };
	mongoose.connect(config.db, options);
};

connect();

//error handler
mongoose.connection.on('error', function(err){
	throw err;
});

//reconnect when disconnected
mongoose.connection.on('disconnected', function(){
	connect();
});

//connect success
mongoose.connection.once('open', function(){
	console.log('connect mongodb success');
});


/**
 * Connect memcached.
 * Bind the memcached client to app object
 */

app.memcached = new Memcached(config.cacheServer);


/**
 * Init all models
 */
var modelsPath = __dirname + '/models/'
fs.readdirSync(modelsPath).forEach(function(file){
	if ( ~file.indexOf('.js') ) require(modelsPath + file);
});

/**
 * Config the app
 */
require('./config/setapp')(app, config);

/**
 * Boot all controllers.
 * There is no global routing config, it is MVC style
 */
require('./config/boot')(app);

/**
 * Error handler
 */
require('./config/error').errorConfig(app);

/**
 * Launch the app!
 */

http.createServer(app).listen(app.get('port'), function(){
	console.log('ENV: ' + app.get('env') + '\nExpress server listening on port ' + app.get('port'));
});
