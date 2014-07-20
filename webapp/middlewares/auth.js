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
			next(new Error('user not login!'));
		}else{
			next();
		}
	}

	return _userRequired;
}
