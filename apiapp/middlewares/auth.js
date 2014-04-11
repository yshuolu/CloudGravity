/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App');

/**
 * Middleware to authenticate app access
 */

exports.appAuth = function(){
	return function(req, res, next){
		if (!req.query.access_id) return next(new Error('no access id'));

		App
			.findOne({accessId: req.query.access_id})
			.exec(function(err, app){
				if (!err && app){
					//app exits
					req.app = app;

					next();
				}else{
					next(new Error('invalid app access id'));
				}
			});
	}
}