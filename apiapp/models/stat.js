/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Stat schema
 */

var StatSchema = Schema({
	app: {type: Schema.Types.ObjectId, ref: 'App'},
	api: {type: String, default: ''},
	count: {type: Number, default: 0},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

/**
 * Validate
 */

/**
 * Statics
 */

StatSchema.statics = {
	/**
	 * Increment the api consume count with app id and api name
	 *
	 * @param {ObjectId} appId
	 * @param {String} api
	 * @param {Function} fn
	 *
	 * @api public
	 */

	inc: function(appId, api,fn){
		this.update({app: appId, api: api}, { $inc: {count: 1} }, function(err){
			fn(err);
		});
	}
}

var Stat = mongoose.model('Stat', StatSchema);