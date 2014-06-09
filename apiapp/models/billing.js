/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Billing schema
 */

var BillingSchema = Schema({
	app: {type: Schema.Types.ObjectId, ref: 'App'},
	start: {type: Date}, //both start and end are Unix timestamp
	expire: {type: Date}, // [start, expire)
	level: {type: Number, default: 0}, //app level, default lowest, i.e. 0
	consumption: {type: Number, default: 0}, //api consumption
	next: {type: Schema.Types.ObjectId, ref: 'Billing', default: null} //Billing is a queue, implemented by link list
});

/**
 * Methods
 */

BillingSchema.methods = {
	/**
	 * Increment the api consumption in this billing
	 *
	 * @param {Number} amount
	 * @param {Function} fn; fn(err)
	 *
	 * @api public
	 */
	incrementConsumption: function(amount, fn){
		this.update({$inc: {consumption: amount}}, fn);
	}
}

//
mongoose.model('Billing', BillingSchema);
