/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	//alphaId = require('../utils/alphaid');

/**
 * Order schema
 */

var OrderSchema = Schema({
	orderId: Number, // use int as order unique id
	app: {type: Schema.Types.ObjectId, ref: 'App'}, // order for which app
	pending: {type: Boolean, default: true}, // default pending
	createdAt: {type: Date, default: Date.now}
});

/**
 * Validation
 */

//orderId should be unique
OrderSchema.path('orderId').validate(function(orderId, fn){
	if (this.isNew || this.isModified('orderId')){
		mongoose.model('Order')
			.findOne({orderId: orderId})
			.exec(function(err, order){
				fn(!err && !order);
			});
	}else{
		fn(true);
	}
}, 'orderId conflicts');

//when an app has pending order, no more order can be created
OrderSchema.path('pending').validate(function(pending, fn){
	if (pending){
		mongoose.model('Order')
			.findOne({app: this.app, pending: true})
			.exec(function(err, order){
				fn(!err && !order);
			});
	}else{
		fn(true);
	}
}, 'app already has peding order');

/**
 * Virtuals
 */

// OrderSchema
// 	.virtual('shortId')
// 	.get(function(){
// 		return alphaId.encode(this.orderId);
// 	});

//
mongoose.model('Order', OrderSchema);