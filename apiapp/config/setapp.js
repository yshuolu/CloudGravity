var express = require('express'),
	path = require('path'),
	gate = require('../middlewares/gate'),
	util = require('util');

module.exports = function(app, config){
	//extend utils lib
	extendUtils();
	//attach 'useExceptPrefix' and 'magicGet' to app object
	extendAppUtils(app);

	app.set('port', process.env.PORT || config.port);

	app.use(express.logger('dev'));

	//middleware for auth request, only apply to normal request, i.e., request path without prefix '/trial'
	app.useExceptPrefix('/trial', gate.appAuth());
	//middleware for bill app, only apply to normal request
	app.useExceptPrefix('/trial', gate.bill());

	//middleware for auth user, only apply to trial request, i.e., request path with prefix '/trial' 
	app.use('/trial', gate.trialAuth());
	//middleware for count trial, only apply to trial request
	app.use('/trial', gate.countTrial());
}

/**
 * Extend the app oject, to support additional methods.
 *
 * useExceptPrefix - work like 'app.use', except that this will apply to the request whose path does not
 * begin with the prefix;
 *
 * magicGet - work like 'app.get', but it will also create the trial counterpart route
 */
function extendAppUtils(app){
	/**
	 * Add 'useExceptPrefix' - apply middleware to request whose path does not begin with the prefix
	 */
	app.useExceptPrefix = function(prefix, middleware){
		function _nestedMiddleware(req, res, next){
			if ( req.path.indexOf(prefix) != 0 ){
				//without the prefix, apply this middleware
				middleware(req, res, next);
			}else{
				next();
			}
		}

		this.use(_nestedMiddleware);	
	}

	/**
	 * Add 'magicGet' method - create 'get' route and the auto-generated trial counterpart
	 */
	app.magicGet = function(orginalPath, handle, trim){
		//generate the handle of original path
		this.get(orginalPath, handle, function(req, res){
			//output the original result
			res.json(res.outputObj);
		});

		//generate the handle of the corresponding trial path
		//output the trimmed result
		app.get('/trial' + orginalPath, handle, trim);
	}

}

function extendUtils(){
	util.subfields = function(object, propertyList){
		var subfields = {};

		for (var property in object){
			//the property is contained in designated propertyList
			if (propertyList.indexOf(property) != -1){
				//copy this field
				subfields[property] = object[property];
			}
		}

		return subfields;
	}

	util.excludeSubfields = function(object, propertyList){
		var subfields = {};

		for (var property in object){
			if (propertyList.indexOf(property) === -1){
				subfields[property] = object[property];
			}
		}

		return subfields;
	}
}
