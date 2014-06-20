/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	hat = require('hat');


/**
 * App schema
 */

var AppSchema = Schema({
	//public fields
	name: {type: String, default: ''},
	description: {type: String, default: ''},
	url: {type: String, default: ''},

	//private fields -- user can not modify this fields
	accessId: {type: String, default: ''},
	accessKey: {type: String, default: ''},
	user: {type: Schema.Types.ObjectId, ref: 'User'}, 
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now},

	//billing fields, current billing interval
	plan: {type: Schema.Types.ObjectId, ref: 'BillingPlan', default: null}
});

/**
 * Validation
 */

//name required
AppSchema.path('name').required(true, 'app name can not be empty');

//name should be unique for this user
AppSchema.path('name').validate(function(name, fn){
	if (this.isNew || this.isModified('name')){
		var App = mongoose.model('App');
		App.findByName(this.user, this.name, function(err, app){
			fn( !err && !app );
		});
	}else{
		fn(true);
	}
}, 'app name already exits');

//app id required
AppSchema.path('accessId').required(true, 'app id can not be empty');

//app key required
AppSchema.path('accessKey').required(true, 'app key can not be empty');

//user required
AppSchema.path('user').required(true, 'app should belong to a user');

//createdAt required
AppSchema.path('createdAt').required(true, 'createdAt should not be empty');

//updatedAt required
AppSchema.path('updatedAt').required(true, 'updatedAt should not be empty');

/**
 * Methods
 */

AppSchema.methods = {
	/**
	 * Refresh Authentication info - assign new 128-bit uuid to access id and key
	 * 
	 * @api public
	 */
	refreshAuth: function(){
		//use hat to generate unique hex
		this.accessId = hat();
		this.accessKey = hat();
	}

}

/**
 * Statics
 */

AppSchema.statics = {
	/**
	 * Find user app by user and app id (the app name)
	 *
	 * @param {ObjectId} userId
	 * @param {String} name
	 * @param {Function} fn
	 *
	 * @api public
	 */
	findByName: function(userId, name, fn){
		this
			.findOne({user: userId, name: name})
			.populate('user')
			.exec(fn);
	},

	/**
	 * List all apps with criteria, and sort it by create date
	 *
	 * @param {Object} criteria
	 * @param {Function} fn
	 *
	 * @api public
	 */
	list: function(criteria, fn){
		if (criteria instanceof Function){
			fn = criteria;
			criteria = {};
		}

		this
			.find(criteria)
			.populate('user')
			.sort({'createdAt': -1})
			.exec(fn);
	} 
}

mongoose.model('App', AppSchema);
