/**
 * It is the middleware module which plays the role of the gate of api
 * service, including a lot of middlewares like auth app and api statistics
 */

/**
 * Module dependencies
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	User = mongoose.model('User'),
	Trial = mongoose.model('Trial'),
	ApiStat = mongoose.model('ApiStat'),
	BillingPlan = mongoose.model('BillingPlan'),
	crypto = require('crypto'),
	newError = require('../config/error').newError;

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
		if (!req.query.timestamp) return next(newError('INVALID_TIMESTAMP'));

		var requestTimestamp = parseInt(req.query.timestamp);

		if (isNaN(requestTimestamp)) return next(newError('INVALID_TIMESTAMP'));

		var currentTimestamp = Math.round( new Date().getTime() / 1000 )

		if (currentTimestamp - requestTimestamp > config.timestampExpire * 60){ 
			//reject the request as replay attack
			return next(newError('INVALID_TIMESTAMP'));
		}

		//check if the access id in params
		if (!req.query.access_id) return next(newError('INVALID_ACCESSID'));

		App
			.findOne({accessId: req.query.access_id})
			.populate('plan') // should populate billing object
			.exec(function(err, app){
				if (!err && app){
					req.app = app;

					if ( verifySignature(req) ){
						next();
					}else{
						next(newError('INVALID_SIGNATURE'));
					}

				}else{
					next(newError('INVALID_ACCESSID'));
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
				next(newError('INTERNAL'));
			}
		});
	}
}

/**
 * Middleware for new billing system.
 */

//No more support for default billing
exports.bill = function(){
	function _bill(req, res, next){
		var plan = req.app.plan;

		//to fix bug, sometimes plan is just the object id
		//cause crash
		//to modify
		if ( plan && !('isExpired' in plan) ) return next();

		if (!plan || plan.isExpired(req.query.timestamp)){
			//no plan or current plan is expired, need to find a up to date plan
			BillingPlan.upToDatePlan(req.app, req.query.timestamp, function(err, validPlan){
				if (err) return next(err);

				if (!validPlan) return next(newError('NO_PLAN'));

				req.app.plan = validPlan._id;

				req.app.save(function(err){
					if (err) return next(err);

					//the app has already updated, need to populate the plan
					req.app.plan = validPlan;

					_bill(req, res, next);
				});
			});

		}else if (plan.isExhausted(config.planLimit[plan.level])){
			//current plan runs out
			//reject
			return next(newError('PLAN_OUT'));

		}else{
			//+1
			return plan.consume(1, function(err){return next(err);});

		}
	}

	return _bill;
}

/**
 * Middleware for user trial auth
 *
 * It's different from appAuth by that it's auth by user email and user trial key.
 * Attach user object to req object.
 */
exports.trialAuth = function(){
	return function(req, res, next){
		//get user by email
		User.findByEmail(req.header('User-Email'), function(err, user){
			if (err) return next(err);
			if (!user) return next(newError('INVALID_TRIAL'));

			if ( user.trialKey === req.header('User-Trial-Key') ){
				req.user = user;
				next();
			}else{
				next(newError('INVALID_TRIAL'));
			}
		});
	};
}

/**
 * Middleware for api trial count
 *
 * Decrease the trial period remainings
 */
exports.countTrial = function(){
	return function(req, res, next){
		Trial.trialOfUser(req.user._id, function(err, trial){
			if (err) return next(err);

			if (!trial){
				var newTrial = new Trial({
					user: req.user._id
				});

				newTrial.renew(minutesToMilliseconds(config.trialInterval), config.trialLimit, function(err){
					if (err) return next(err);

					//everything goes well
					return next();
				});

			}else if (trial.isExpired()){
				trial.renew(minutesToMilliseconds(config.trialInterval), config.trialLimit, function(err){
					if (err) return next(err);

					//everything goes well
					return next();
				});

			}else if (trial.isExhausted()){
				return next(newError('TRIAL_OUT'));

			}else{
				trial.consume(1, function(err){
					if (err) return next(err);

					return next();
				});
			}
		});
	};
}

//CORS
exports.allowCrossDomain = function(){
	return function(req, res, next){
		res.header('Access-Control-Allow-Origin', config.allowedDomains);
		res.header('Access-Control-Allow-Headers', config.allowedHeaders);
		return next();
	}
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

function minutesToMilliseconds(minutes){
	return minutes * 60 * 1000;
}
