/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Stat schema
 */

var ApiStatSchema = Schema({
	app: {type: Schema.Types.ObjectId, ref: 'App'},
	api: {type: String, default: ''},
	count: {type: Number, default: 1},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

/**
 * Validate
 */

//app required
ApiStatSchema.path('app').required(true, 'apiStat should belong to an app');

//api required
ApiStatSchema.path('api').required(true, 'api name should not be empty');

//count shoud be non-negative
ApiStatSchema.path('count').validate(function(count){
	return count >= 0;
});

//createdAt
ApiStatSchema.path('createdAt').required(true, 'createdAt shoud not be empty');

//updatedAt
ApiStatSchema.path('updatedAt').required(true, 'updatedAt shoud not be empty');


/**
 * Methods
 */


/**
 * Statics
 */

ApiStatSchema.statics = {
	/**
	 * Update 'count' and 'updatedAt'. Lazy intitialize apiStat instance and
	 * update it when following same api request arriving.
	 *
	 * @param {ObjectId} appId
	 * @param {String} api
	 * @param {Function} fn; fn(err, newCount)
	 *
	 * @api public
	 */

	updateStat: function(appId, api, fn){
		//check if there is already apiStat instance for tuple (app, api)
		this
			.findOne({app: appId, api: api})
			.exec(function(err, apiStat){
				if (err) return fn(err);
				
				if (apiStat){
					//the apiStat (app, api) already created
					//update it
					apiStat
						.update({$inc: {count: 1}, $set: {updatedAt: Date.now()}}, function(err){
							if (err) return fn(err);

							//update success
							fn(err, apiStat.count);
						});

				}else{
					//need to lazy initialize a apiStat for this tuple (app, api)
					var ApiStat = mongoose.model('ApiStat');
					var newApiStat = new ApiStat({app: appId, api: api});

					newApiStat.save(function(err, apiStat){
						if (err) return fn(err);

						//init new apiStat success, and the count already set to 1
						fn(err, apiStat.count);
					});
				}
			});
	},

	/**
	 * Find all apiStat of an app, and sort it by createdAt
	 * 
	 * @param {ObjectId} appId
	 * @param {Function} fn
	 *
	 * @api public
	 */
	fetchStatOfApp: function(appId, fn){
		this
			.find({app: appId})
			.populate('app')
			.sort({'createdAt': -1})
			.exec(fn);
	}
}

var ApiStat = mongoose.model('ApiStat', ApiStatSchema);