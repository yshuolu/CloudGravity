/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Billing = mongoose.model('Billing'),
	App = mongoose.model('App');

/**
 * Middleware to load app from access id
 */

exports.loadApp = function(){
	return function(req, res, next, accessid){
		App
			.findOne({accessId: accessid})
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

exports.createNextBilling = function(req, res){
	var startDate = new Date();
	var expireDate = new Date( startDate.getTime() + 1 * 60 * 1000 ); // 1 minute

	var newBilling = new Billing({
		app: req.userApp._id,
		start: startDate,
		expire: expireDate,
		level: 1
	});

	req.userApp.populate('billing', function(err, app){
		var oldBilling = app.billing;

		if (err) return res.send('create billing failed');

		if (!oldBilling || oldBilling.level === 0){
			req.userApp.billing = newBilling._id;

			newBilling.save(function(err){
				if (err) return res.send('create billing failed');

				req.userApp.save(function(err){
					if (err) return res.send('create billing failed');

					if (oldBilling){
						oldBilling.remove(function(err){
							if (err) return res.send('create billing failed');

							return res.send('create billing success');
						});
					}else{
						return res.send('create billing success');
					}
				});
			});

		}else{
			//add to tail
			findBillingLinkListTail(oldBilling, function(err, tail){
				if (err) return res.send('create billing failed');

				tail.next = newBilling._id;

				//
				if ( new Date().getTime() < tail.expire.getTime() ){
					newBilling.start = tail.expire;
					newBilling.expire = new Date( tail.expire.getTime() + 1 * 60 * 1000 );
				}

				newBilling.save(function(err){
					if (err) return res.send('create billing failed');

					tail.save(function(err){
						if (err) return res.send('create billing failed');

						return res.send('create billing success');
					});
				});
			});
		}

	});
}

/**
 * Local functions
 */

function findBillingLinkListTail(billing, fn){
	if (!billing) return null;

	billing.populate('next', function(err, billing){
		if (!billing.next){
			fn(err, billing);

		}else{
			findBillingLinkListTail(billing.next, fn);
		}
	});
}
