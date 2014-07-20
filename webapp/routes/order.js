/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	App = mongoose.model('App'),
	Order = mongoose.model('Order'),
	alphaId = require('../utils/alphaid');

exports.create = function(req, res, next){
	//get corresponding app object
	App.findByName(req.session.user._id, req.body.name, function(err, app){
		if (err) return next(err);

		if (!app) return next('invalid parameter');

		var newOrder = new Order({
			app: app._id,
			orderId: uniqueId(),
			pending: true
		});

		console.log(alphaId.encode(newOrder.orderId));

		newOrder.save(function(err){
			if (err) return next(err);

			res.send('create order success');
		});
	});
}

exports.show = function(req, res, next){
	var orderId = alphaId.decode(req.params.shortId);

	if (isNaN(orderId)) return next('invalid shortId');

	Order
		.findOne({orderId: orderId})
		.exec(function(err, order){
			if (err) return next(err);

			if (!order) return next('invalid shortId');

			res.json(order);
		});
}

/**
 * Local functions
 */

function uniqueId(){
	var prefix = Math.round( new Date().getTime() / 1000 ) + ''; // timestamp prefix

	var suffix = Math.round( Math.random() * 100 ) + ''; // 1 to 10000 random variable

	var padding = '';

	for (var i=0; i<=2-suffix.length; i++){
		padding += '0';
	}

	suffix = padding + suffix;

	var uniqueId = prefix + suffix;

	return parseInt(uniqueId);
}