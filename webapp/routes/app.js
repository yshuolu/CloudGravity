/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	extend = require('util')._extend;


/**
 * Middleware to handle app id param. From :id param to req.app.
 * :id is the name of app
 */

exports.loadApp = function(){
	return function(req, res, next, id){
		App.findByName(req.user._id, id, function(err, app){
			if (!err && app){
				//fetch the app object
				req.app = app;
				next();
			}else{
				//error
				next(err ? err : new Error('app not exits!'));
			}
		});
	}
}

/**
 * Create a new app
 */

exports.create = function(req, res){
	var newApp = new App(req.body);
	newApp.user = req.user._id;

	//assign auth info to new created app
	newApp.refreshAuth();

	newApp.save(function(err, app){
		if (err){
			//save err
			return res.send('create app failed!\n');
		}

		res.json(app);
	});
}

/**
 * Show app list for this user if user logged in, else
 * show the land page
 */

exports.list = function(req, res){
	if (req.user){
		App.list(req.user._id, function(err, apps){
			for (app in apps){
				//
			}

			res.render('applist', {user: req.user, apps: apps});
		});

	}else{
		//user not logged in, show land page
		res.render('land');
	}
}

/**
 * Show an app with name
 */

exports.show = function(req, res){
	res.json(req.app);
}

/**
 * Modify an app
 */

exports.modify = function(req, res){
	var modifiedApp = extend(req.app, sanitize(req.body));

	modifiedApp.save(function(err, app){
		if (!err){
			//save success
			res.json(app);
		}else{

			res.send('modify app failed!\n');
		}
	});
}


/**
 * Delete an app
 */

exports.delete = function(req, res){
	req.app.remove(function(err){
		if (!err){
			//remove success
			res.redirect('/app');
		}else{

			res.send('remove app failed!\n');
		}
	});
}

/**
 * Modify or Delete an app.
 * To support web browsers, which do not support PUT and DEL method.
 * Use POST field del to indicate modify or delete.
 */

exports.modifyOrDelete = function(req, res){
	if (req.body.del){
		exports.delete(req, res);
	}else{
		exports.modify(req, res);
	}
}

/**
 * Local help functions
 */

//drop any fields that can not be modified by user
function sanitize(object){
	var publicFields = ['name', 'description', 'url'];

	for (key in object){
		if ( ~publicFields.indexOf(key) ){
			String(object[key]);
		}else{
			delete object[key];
		}
	}

	return object;
}