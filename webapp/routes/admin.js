/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	BillingPlan = mongoose.model('BillingPlan'),
	App = mongoose.model('App'),
	Invitation = mongoose.model('Invitation'),
	User = mongoose.model('User'),
	Order = mongoose.model('Order'),
	alphaId = require('../utils/alphaid'),
	env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

/**
 * Middleware to load app from access id
 */

// exports.loadApp = function(){
// 	return function(req, res, next, accessid){
// 		App
// 			.findOne({accessId: accessid})
// 			.populate('plan')
// 			.exec(function(err, app){
// 				if (!err && app){
// 					req.userApp = app;

// 					next();
// 				}else{
// 					next(err ? err : new Error('app not exits!'));
// 				}
// 			});
// 	}
// }

exports.loadOrder = function(){
	return function(req, res, next){
		var orderId = alphaId.decode(req.body.shortId);

		if (isNaN(orderId)) return next('invalid short id');

		Order
			.findOne({orderId: orderId})
			.populate('app')
			.exec(function(err, order){
				if (err) return next(err);

				if (!order) return next('invalid short id');

				req.order = order;

				next();
			});
	}
}

/**
 * Create new invitation code
 */

exports.invite = function(req, res){
	var MAGIC = 'phineas';

	if (req.body.magic === MAGIC){
		//valid magic code
		var invitation = new Invitation({
			code: alphaId.encode( Math.round( Math.random() * 1000000 ) )
		});

		invitation.save(function(err){
			if (err) return next(err);

			//create invitation code success
			res.send(invitation.code + '\n');
		});
	}else{
		next('invalid magic');
	}
}


/**
 * Admin sign up.
 * The same sign up as normal user, except that it requires invitation code.
 */

exports.signup = function(req, res, next){
	Invitation
		.findOne({code: req.body.invitation})
		.exec(function(err, invitation){
			if (err) return next(err);

			if (!invitation) return next('invalid invitation code');

			//do get invitation code
			req.body.isAdmin = true;
			var admin = new User(req.body);
			admin.save(function(err, user){
				if (err) return next(err);

				req.session.userId = user.id;
				req.session.isAdmin = true;

				//delete used invitation
				invitation.remove(function(err){
					if (err) return next(err);

					//
					res.send('create admin success');
				});
			});
		});
}

/**
 * Create next level 1 billing for user.
 */

exports.newBillingPlan = function(req, res, next){
	//
	//var appId = req.userApp._id;
	var appId = req.order.app._id;

	//level 1
	var level = 1;

	//find the latest high level billing plan
	BillingPlan.latestPlanForApp(appId, function(err, plan){
		var current = new Date();

		//if plan exists and not expired yet
		if (plan && current < plan.expire){
			current = plan.expire; //make continuous plan interval after the latest one
		}

		//create new billing plan
		var newPlan = new BillingPlan({
			app: appId,
			start: current,
			expire: new Date( current.getTime() + minutesToMilliseconds(config.billPlanInterval) ),
			level: level
		});

		newPlan.save(function(err){
			if (err) return next(err);
			
			//finish order
			req.order.pending = false;
			req.order.save(function(err){
				if (err) return next(err);

				return res.send('create new plan success');
			});
			
		});

	});
}

/**
 * Local function to save an array of documents at once.
 */

function saveDocArray(array, fn){
	var reside = array.length;

	array.forEach(function(doc){
		doc.save(function(err){
			//error happens in other iteration
			if (reside == -1){
				return;
			}

			if (err) {
				reside = -1;
				return fn(err);
			}

			reside--;

			if (reside == 0){
				fn();
			}
		});
	});
}


function minutesToMilliseconds(minutes){
	return minutes * 60 * 1000;
}