/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * Restore user object with session
 */

exports.sessionAuth = function(){
	function _sessionAuth(req, res, next){
		User
			.findById(req.session.userId)
			.exec(function(err, user){
				if (!err && user){
					//set user object for req
					req.user = user;
				}

				next();
			});
	}

	return _sessionAuth;
}


exports.userRequired = function(){
	function _userRequired(req, res, next){
		if (!req.session.user){
			res.redirect('/signin');
		}else{
			next();
		}
	}

	return _userRequired;
}

exports.adminRequired = function(){
	return function(req, res, next){
		if (!req.session.user || !req.session.user.isAdmin){
			next(new Error('invalid admin'));
		}else{
			next();
		}
	}
}

