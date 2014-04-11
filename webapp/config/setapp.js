var express = require('express'),
	path = require('path'),
	auth = require('../middlewares/auth');


//set up the app
module.exports = function(app, config){
	// all environments
	app.set('port', process.env.PORT || config.port);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
		
	//middleware settings
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.session({secret: "This is a secret"}));
	app.use(express.bodyParser());
	app.use(express.favicon());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(auth.sessionAuth());

	// development only
	app.configure('development', function(){
	  app.use(express.errorHandler());
	});
}