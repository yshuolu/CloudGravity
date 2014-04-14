/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	ApiStat = mongoose.model('ApiStat');
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
				req.userApp = app;
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

		res.redirect('/');
	});
}

/**
 * Show app list for this user if user logged in, else
 * show the land page
 */

exports.list = function(req, res){
	if (req.user){
		App.list({user: req.user._id}, function(err, apps){
			//no app created, render the page directly
			if (apps.length == 0) return res.render('applist', {user: req.user, apps: [], cost: 0});

			//has app list
			//count all api cost
			var resid = apps.length;
			var totalApiCount = 0;

			for (app in apps){
				//
				ApiStat
					.find({app: app._id})
					.exec(function(err, stats){
						if (err) return res.send('error');

						//increment total api count
						stats.forEach(function(stat){ totalApiCount += stat.count;});

						//decrese resid
						resid--;

						//check end point
						if (resid == 0){
							res.render('applist', {user: req.user, apps: apps, cost: totalApiCount});
						}
					});
			}

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
	ApiStat.fetchStatOfApp(req.userApp._id, function(err, stats){
		res.render('showapp', {user: req.user, app: req.userApp, stats: stats});
	});
}

/**
 * Modify an app
 */

exports.modify = function(req, res){
	var modifiedApp = extend(req.userApp, sanitize(req.body));

	modifiedApp.save(function(err, app){
		if (!err){
			//save success
			res.redirect('/app/'+app.name);
		}else{

			res.send('modify app failed!\n');
		}
	});
}


/**
 * Delete an app
 */

exports.delete = function(req, res){
	req.userApp.remove(function(err){
		if (!err){
			//remove success
			res.redirect('/');
		}else{

			res.send('remove app failed!\n');
		}
	});
}

/**
 * Show the creat app page
 */

exports.createPage = function(req, res){
	res.render('createapp', {user: req.user});
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