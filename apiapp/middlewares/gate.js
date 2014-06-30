/**
 * It is the middleware module which plays the role of the gate of api
 * service, including a lot of middlewares like auth app and api statistics
 */

/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	ApiStat = mongoose.model('ApiStat'),
	BillingPlan = mongoose.model('BillingPlan'),
	crypto = require('crypto');

//Todo: modify the way to get config
var env = process.env.NODE_ENV || 'development',
	config = require('../config/config')[env];


/**
 * Middleware to authenticate the api access.
 * check if the request come from a valid app, and bind 
 * the app to req object
 */

exports.appAuth = function(){
	return function(req, res, next){
		//validate the timestamp
		if (!req.query.timestamp) return next(new Error('no timestamp'));

		var requestTimestamp = parseInt(req.query.timestamp);

		if (isNaN(requestTimestamp)) return next(new Error('invalid timestamp'));

		var currentTimestamp = Math.round( new Date().getTime() / 1000 )

		if (currentTimestamp - requestTimestamp > config.timestampExpire * 60){ 
			//reject the request as replay attack
			return next(new Error('timestamp too far'));
		}

		//check if the access id in params
		if (!req.query.access_id) return next(new Error('no access id'));

		App
			.findOne({accessId: req.query.access_id})
			.populate('plan') // should populate billing object
			.exec(function(err, app){
				if (!err && app){
					req.app = app;

					if ( verifySignature(req) ){
						next();
					}else{
						next(new Error('invalid signature'));
					}

				}else{
					next(new Error('invalid app access id'));
				}
			});
	}
}

/**
 * Middleware for api statistics.
 * Record the meta data about api access.
 * For example, record which app use which api and the count.
 */

exports.statistics = function(){
	return function(req, res, next){
		ApiStat.updateStat(req.app._id, req.path, function(err, newCount){
			if (!err){
				//update the api count successfully
				next();

			}else{
				//can not increment the api count
				next(new Error('update api count failed!'));
			}
		});
	}
}

/**
 * Middleware for new billing system.
 */

exports.bill = function(){
	function _bill(req, res, next){
		if (!req.app.plan){
			//attach a default plan
			var defaultPlan = new BillingPlan();

			setDefaultPlan(defaultPlan);

			req.app.plan = defaultPlan._id;

			saveDocArray([req.app, defaultPlan], function(err){
				return next(err);
			});

		}else if ( isPlanExpired(req.app.plan, req.query.timestamp) && req.app.plan.level == 0){
			//default billing plan expire
			//reset it
			setDefaultPlan(req.app.plan);

			req.app.plan.save(function(err){
				return next(err);
			});

		}else if ( isPlanExpired(req.app.plan, req.query.timestamp) && req.app.plan.level != 0 ){ 
			//high level plan expired
			//find a valid high level billing plan for this timestamp
			getValidPlan(req, req.query.timestamp, function(err, plan){
				if (err) return next(err);

				req.app.plan = plan._id;

				req.app.save(function(err){
					if (err) return next(err);

					_bill(req, res, next);
				});
			});

		}else if ( isPlanExhausted(req.app.plan) ){
			//reject
			return next('run out of this plan limit');

		}else{
			//+1
			req.app.plan.incrementConsumption(1, function(err){return next(err);});
		}
	}

	return _bill;
}
 

/**
 * Local function to verify user request signature.
 * Calculate the signature of request and then compare it with 
 * that sent with user request.
 */

function verifySignature(req){
	//compose the param string first
	//sort the key of all params alphabetically
	var paramKeys = [];

	for (var key in req.query){
		if (key != 'signature'){
			paramKeys.push(key);
		}
	}

	paramKeys.sort();

	var paramString = '';
	for (var index in paramKeys){
		paramString += paramKeys[index] + '=' + req.query[paramKeys[index]] + '&';
	}

	paramString = paramString.slice(0, -1);

	//compose the string to sign
	//var hash = crypto.createHmac('sha1', 'ad').update('huahua').digest('hex');
	var stringToSign = encodeURIComponent(req.host+req.path) + '&' + encodeURIComponent(paramString);

	//sign this string with user's access_key, and encode the binary digest by base64
	//var accessKey = req.app.access_key;
	var signature = crypto.createHmac('sha256', req.app.accessKey).update(stringToSign).digest('base64');

	//compare the signatures
	return (signature === req.query.signature)
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

/**
 * Local function to set default billing plan's attributes
 */

function setDefaultPlan(plan){
	var interval = 1 * 60 * 1000; // 1 minute

	plan.start = new Date();
	plan.expire = new Date( plan.start.getTime() + interval );
	plan.consumption = 1; //set 1 as first consumption
	plan.level = 0;
}

/**
 * Local function to test if billing expired
 * Todo: maybe move to the model methods!!
 */

function isPlanExpired(plan, timestamp){
	if ( plan.expire.getTime() / 1000 <= timestamp ){
		return true;
	}

	return false;

}

function isPlanExhausted(plan){
	return plan.consumption >= config.consumptionLimit[plan.level];
}

