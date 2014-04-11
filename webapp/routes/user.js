/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	app = require('../app'),
	config = require('../config/config')[app.get('env')],
	User = mongoose.model('User'),
	ObjectId = mongoose.Types.ObjectId;

/**
 * Register a new user
 */

exports.signup = function(req, res){
	var newUser = new User(req.body);

	newUser.save(function(err, user){
		if (err){
			console.log(err);
			res.send('register failed\n');
			return;
		}

		//user register success
		req.session.userId = user.id;

		res.send('register success\n');
	});
}

/**
 * User login
 */

exports.signin = function(req, res){
	User
		.findOne({email: req.body.email})
		.exec(function(err, user){
			//match password
			if ( !err && user && user.authenticate(req.body.pass) ){
				//generate a new session
				//bind user object id to this session
				req.session.regenerate(function(err){
					req.session.userId = user.id;

					//check if keep signin for a period
					if (req.body.keepin){
						var maxAge = config.sessionMaxAge;
						req.session.cookie.expires = new Date(Date.now() + maxAge);
						req.session.cookie.maxAge = maxAge;
					}

					res.send('login success\n');
				});
				
			}else{
				//login failed
				res.send('login failed\n');
			}
		});
}

/**
 * User Logout
 */

exports.signout = function(req, res){
	req.session.destroy(function(err){
		res.send('logout success!\n');
	});
}


//test
exports.test = function(req, res){
	res.send('Hello  ' + req.user.name + '\n');
}