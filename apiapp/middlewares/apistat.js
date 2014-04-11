/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Stat = mongoose.model('Stat');

/**
 * Middleware for api statistics 
 */

exports.stat = function(){
	return function(req, res, next){
		Stat.inc(req.app._id, req.path, function(err){
			if (err) throw err;

			next();
		});
	}
}