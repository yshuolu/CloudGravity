/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	ApiStat = mongoose.model('ApiStat'),
	extend = require('util')._extend;
	BillingPlan = mongoose.model('BillingPlan'),
	Order = mongoose.model('Order'),
	time = require('../utils/time'),
	env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env],
    alphaId = require('../utils/alphaid');


/**
 * Middleware to handle app id param. From :id param to req.app.
 * :id is the name of app
 */

exports.loadApp = function(){
	return function(req, res, next, id){
		App.findByName(req.session.user._id, id, function(err, app){
			if (!err && app){
				//fetch the app object
				req.userApp = app;
				next();
			}else{
				//error
				if (!err){
					err = new Error('app not exits');
					err.status = 404;
				}
				next(err);
			}
		});
	}
}

/**
 * Create a new app
 */

exports.create = function(req, res){
	var newApp = new App(req.body);
	newApp.user = req.session.user._id;

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

exports.list = function(req, res, next){
	if (req.session.user){
		App.list({user: req.session.user._id}, function(err, apps){
			//no app created, render the page directly
			//if (apps.length == 0) return res.render('applist', {user: req.session.user, apps: [], cost: 0});

			//has app list
			//count all api cost
			var reside = apps.length;
			var totalApiCount = 0;

			//for each app, get current plan and pending order
			apps.forEach(function(app){

				// var app = apps[index];

				BillingPlan.latestPlanForApp(app._id, function(err, plan){
					if (err) return next(err);

					app.plan = plan;

					Order.findOne({app: app._id, pending: true}, function(err, order){
						if (err) return next(err);

						//get app's pending order
						app.order = order;
						if (order){
							app.order.shortId = alphaId.encode(order.orderId);
						}

						//set app's current plan state
						if (!app.plan || app.plan.expire < new Date()){
							app.planState = '无';
						}else{
							app.planState = '已购买至' + time.chinaMoment(app.plan.expire).format('MM月DD日');
						}

						//success, decrement reside
						reside--;

						//check if all done
						if (reside === 0){
							return res.render('applist', {user: req.session.user, apps: apps});
						}
					});

				});
			});

		});

	}else{
		//user not logged in, show land page
		res.render('landing');
	}
}

/**
 * Show an app with name
 */

exports.show = function(req, res, next){
	if (req.query.tab === 'plan'){
		//get all plans
		BillingPlan.allPlansForApp(req.userApp._id, function(err, all, current){
			if (err) return next(err);

			//format current if needed
			if (current) {
				current = current.toObject();
				current.expire = time.chinaMoment(current.expire).format('MM月DD日');
			}

			//format all plan history
			var allPlans = [];

			for (var index in all){
				var plan = all[index].toObject();

				//
				if (plan.start > new Date()){
					plan.planState = 'FUTURE';
				}else if (plan.expire < new Date()){
					plan.planState = 'EXPIRED';
				}else{
					plan.planState = 'NOW';
				}

				//format time
				plan.start = time.chinaMoment(plan.start).format('YYYY/MM/DD');
				plan.expire = time.chinaMoment(plan.expire).format('YYYY/MM/DD');

				allPlans.push(plan);
			}

			var renderParams = {
				user: req.session.user,
				app: req.userApp,
				current: current,
				plans: allPlans,
				limit: config.planLimit[1],
				index: 1
			};

			res.render('app_plan', renderParams);
		});
	}else if (req.query.tab === 'auth'){
		res.render('app_auth', {user: req.session.user, app: req.userApp, index: 2});
	}else if (req.query.tab === 'setting'){
		res.render('app_setting', {user: req.session.user, app: req.userApp, index: 3});
	}else{
		var err = new Error('404 not found');
		err.status = 404;
		return next(err);
	}
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
	res.render('newapp', {user: req.session.user});
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
