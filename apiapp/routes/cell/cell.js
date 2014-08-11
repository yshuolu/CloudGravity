/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Predefine variable.
 */

var EARTH_RADIUS = 6378137; //earth radius in meter

/**
 * Cell schema
 * MCC, MNC, LAC, CELL, LAC16, CELL16, LNG, LAT, O_LNG, O_LAT, PRECISION, ADDRESS
 */

var CellSchema = Schema({
	mcc: {type: Number}, 
	mnc: {type: Number}, 
	lac: {type: Number},
	cell: {type: Number}, 
	lng: {type: Number}, 
	lat: {type: Number}, 
	o_lng: {type: Number}, 
	o_lat: {type: Number}, 
	precision: {type: Number}, 
	address: {type: String},
	province: {type: String},
	city: {type: String},
	county: {type: String},
	town: {type: String},
	village: {type: String},
	street: {type: String},
	streetno: {type: String},
	source: {type: String},
	loc: {
		type: {type: String},
		coordinates: {type: [Number]}
	}
}, {collection: 'cells'});

/**
 * Statics
 */

CellSchema.statics = {
	/**
	 * Find cell with LAC and CELL; Alternatively, LAC16 and CELL16
	 * 
	 # @param {Number} mnc
	 * @param {Number} lac
	 * @param {Number} cell
	 * @param {Boolean} isHEX
	 * @param {Function} fn
	 * 
	 * @api public
	 */

	findByLacAndCell: function(mnc, lac, cell, fn){
		var criteria;

		if (mnc === 0 || mnc === 1){
			criteria = {mnc: mnc, lac: lac, cell: cell};
		}else{
			criteria = {mnc: {$nin: [0, 1]}, lac: lac, cell: cell};
		}

		this
			.find(criteria)
			.exec(fn);
	},

	/**
	 * Find nearest cells with longitude, latitude and distance, and the result is paging.
	 *
	 * @param {Number} lng
	 * @param {Number} lat
	 * @param {Number} dis
	 * @param {Number} page
	 * @param {Function} fn
	 *
	 * @api public
	 */

	findNearestCells: function(lng, lat, dis, limit, fn){
		//set optional params
		var optional = {
						spherical: true, 
						distanceMultiplier: EARTH_RADIUS, 
						maxDistance: dis/EARTH_RADIUS, 
						num: limit
					   };

		//runCommand geoNear
		this.collection.geoNear(lng, lat, optional, function(err, cells){
			fn(err, cells);
		});
	}
}

var Cell = mongoose.model('Cell', CellSchema);



