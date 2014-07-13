/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Trial schema
 */

var TrialSchema = Schema({
	user: {type: Schema.Types.ObjectId, ref:'User'},
	remaining: {type: Number, default: 0},
	expire: {type: Date, default: Date.now}
});

/**
 * Statics
 */

TrialSchema.statics = {
	/**
	 * Find trial by User Id
	 *
	 * @param {ObjectId} userId
	 * @param {Function} fn; fn(err, trial)
	 *
	 * @api public
	 */
	trialOfUser: function(userId, fn){
		this
			.findOne({user: userId})
			.exec(fn);
	}
}


/**
 * Methods
 */

TrialSchema.methods = {
	/**
	 * Decrease the remaining api trial count
	 *
	 * @param {Number} amount
	 * @param {Function} fn; fn(err)
	 *
	 * @api public
	 */
	consume: function(amonut, fn){
		this.update({$inc: {remaining: -amonut}}, fn);
	},

	/**
	 * Test if current trial period expires
	 * 
	 * @return {Boolean}
	 *
	 * @api public
	 */
	isExpired: function(){
		return this.expire < new Date();
	}, 

	/**
	 * Test if current trial period run out of the limit
	 *
	 * @return {Boolean}
	 *
	 * @api public
	 */
	isExhausted: function(){
		return this.remaining <= 0;
	},

	/**
	 * Renew the trial period
	 *
	 * @param {Number} interval
	 * @param {Number} limit
	 * @param {Function} fn; fn(err)
	 * 
	 * @api public
	 */
	renew: function(interval, limit, fn){
		this.expire = new Date(new Date().getTime() + interval);
		this.remaining = limit - 1;
		this.save(fn);
	}

}

//
mongoose.model('Trial', TrialSchema);