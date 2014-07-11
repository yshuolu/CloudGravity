var express = require('express'),
	path = require('path'),
	gate = require('../middlewares/gate');

module.exports = function(app, config){
	// all environments
	app.set('port', process.env.PORT || config.port);
	app.use(express.logger('dev'));
	app.use(express.static(path.join(__dirname, 'public')));

	//middleware to auth trial request
	app.use('/trial', gate.test());

	//middleware to auth request
	app.use(gate.appAuth());

	//
	app.use(gate.bill());

	// development only
	app.configure('development', function(){
	  app.use(express.errorHandler());
	});
}
