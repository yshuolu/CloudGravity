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

		res.redirect('/');
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
					//attach user object to session
					req.session.user = user.toObject();

					//check if keep signin for a period
					if (req.body.keepin){
						var maxAge = config.sessionMaxAge;
						req.session.cookie.expires = new Date(Date.now() + maxAge);
						req.session.cookie.maxAge = maxAge;
					}

					res.redirect('/');
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
		res.redirect('/');
	});
}

/**
 * Show login page if no user session, else redirect to /
 */

exports.loginPage = function(req, res){
	if (!req.user){
		res.render('login');
	}else{
		res.redirect('/');
	}
}


/**
 * Show user profile page
 */
exports.profile = function(req, res){
	res.render('profile', {user: req.user});
}