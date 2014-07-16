/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	BillingPlan = mongoose.model('BillingPlan'),
	App = mongoose.model('App'),
	env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

/**
 * Middleware to load app from access id
 */

exports.loadApp = function(){
	return function(req, res, next, accessid){
		App
			.findOne({accessId: accessid})
			.populate('plan')
			.exec(function(err, app){
				if (!err && app){
					req.userApp = app;

					next();
				}else{
					next(err ? err : new Error('app not exits!'));
				}
			});
	}
}

/**
 * Create next level 1 billing for user.
 */

exports.newBillingPlan = function(req, res){
	//
	var appId = req.userApp._id;
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
			if (err)
				return res.send('create new plan error');
			else
				return res.send('create new plan success');
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