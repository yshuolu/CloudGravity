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

exports.signup = function(req, res, next){
	var newUser = new User(req.body);

	newUser.save(function(err, user){
		if (err){
			if (err.name === 'ValidationError'){
				//validation error
				req.session.error = '邮箱' + req.body.email + '已经存在，请使用新的email注册';
				return res.redirect('/signup');

			}else{
				//internal error
				return next(err);
			}
		}

		//user register success
		req.session.user = user.toObject();

		res.redirect('/');
	});
}

exports.signupPage = function(req, res){
	if (req.session.user) return res.redirect('/');

	res.render('signup', {error: req.session.error});
	req.session.error = null;
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

					if (req.session.user.isAdmin){
						res.redirect('/admin');
					}else{
						//for normal user
						res.redirect('/');
					}
				});
				
			}else{
				//login failed
				req.session.error = '用户名密码错误';
				res.redirect('/signin');
			}
		});
}

exports.signinPage = function(req, res){
	if (req.session.user) return res.redirect('/');

	res.render('signin', {error: req.session.error});
	req.session.error = null;
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

// exports.signinPage = function(req, res){
// 	if (!req.user){
// 		res.render('login');
// 	}else{
// 		res.redirect('/');
// 	}
// }


/**
 * Show user profile page
 */
exports.profile = function(req, res){
	res.render('profile', {user: req.user});
}