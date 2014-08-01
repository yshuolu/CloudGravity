/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Billing schema
 */

var BillingPlanSchema = Schema({
	app: {type: Schema.Types.ObjectId, ref: 'App'},
	start: {type: Date}, //both start and end are Unix timestamp
	expire: {type: Date}, // [start, expire)
	level: {type: Number, default: 0}, //app level, default lowest, i.e. 0
	consumption: {type: Number, default: 0}, //api consumption
});


/**
 * Methods
 */

BillingPlanSchema.methods = {
	/**
	 * Increment the api consumption in this billing
	 *
	 * @param {Number} amount
	 * @param {Function} fn; fn(err)
	 *
	 * @api public
	 */
	consume: function(amount, fn){
		this.update({$inc: {consumption: amount}}, fn);
	},

	/**
	 * Reset plan attributes (without save) as a new default plan, start from now.
	 * Require the default plan interval in milliseconds.
	 *
	 * @param {Number} interval
	 *
	 * @api public
	 */
	renewDefaultPlan: function(interval){
		this.start = new Date();
		this.expire = new Date( this.start.getTime() + interval);
		this.consumption = 1;
		this.level = 0;
	},

	/**
	 * Test if the plan is expired compared to the timstamp
	 *
	 * @param {Number} timestamp
	 * @return {Boolean}
	 *
	 * @api public
	 */
	isExpired: function(timestamp){
		if ( this.expire.getTime() / 1000 <= timestamp ){
			return true;
		}

		return false;
	},

	/**
	 * Test if the plan is exhausted
	 * 
	 * @param {Number} limit
	 * @return {Boolean}
	 * 
	 * @api public
	 */
	isExhausted: function(limit){
		return this.consumption >= limit;
	}

}

/**
 * Statics
 */

BillingPlanSchema.statics = {
	/**
	 * Find the latest high level billing plan of app
	 *
	 * @param {ObjectId} appId
	 * @param {Function} fn; fn(err, plan)
	 *
	 * @api public
	 */
	latestPlanForApp: function(appId, fn){
		this
			.findOne({app: appId})
			.sort({expire: -1})
			.exec(fn);
	},

	/**
	 * Find the high level billing plan which is up to date for this timestamp
	 *
	 * @param {ObjectId} appId
	 * @param {Number} timestamp
	 * @param {Function} fn; fn(err, plan)
	 *
	 * @api public
	 */ 
	upToDatePlan: function(appId, timestamp, fn){
		var date = new Date( timestamp * 1000 );

		this
			.findOne({app: appId, start: {'$lte': date}, expire: {'$gt': date}}) //start <= timestamp < expire
			.exec(fn);
	},

	/**
	 * Fetch all plan of the app sorted by time and indicate current one if it exists
	 *
	 * @param {ObjectId} appId
	 * @param {Function} fn; fn(err, all, current)
	 *
	 * @api public
	 */
	allPlansForApp: function(appId, fn){
		this
			.find({app: appId})
			.sort({expire: -1})
			.exec(function(err, docs){
				var currentPlan = null;
				var now = new Date();

				for (var index in docs){
					var doc = docs[index];

					if (doc.start <= now && doc.expire > now){
						currentPlan = doc;
					}
				}

				fn(err, docs, currentPlan);
			});
	}
}

//
mongoose.model('BillingPlan', BillingPlanSchema);
