var express = require('express'),
	path = require('path'),
	auth = require('../middlewares/auth'),
	apiStat = require('../middlewares/apistat');

module.exports = function(app, config){
	// all environments
	app.set('port', process.env.PORT || config.port);
	app.use(express.logger('dev'));
	app.use(express.static(path.join(__dirname, 'public')));

	//
	app.use(auth.appAuth());
	app.use(apiStat.stat());

	// development only
	app.configure('development', function(){
	  app.use(express.errorHandler());
	});
}