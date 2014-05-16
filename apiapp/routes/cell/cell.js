/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Cell schema
 * MCC, MNC, LAC, CELL, LAC16, CELL16, LNG, LAT, O_LNG, O_LAT, PRECISION, ADDRESS
 */

var CellSchema = Schema({
	MCC: {type: Number}, 
	MNC: {type: Number}, 
	LAC: {type: Number},
	CELL: {type: Number}, 
	LAC16: {type: String}, 
	CELL16: {type: String}, 
	LNG: {type: Number}, 
	LAT: {type: Number}, 
	O_LNG: {type: Number}, 
	O_LAT: {type: Number}, 
	PRECISION: {type: Number}, 
	ADDRESS: {type: String}
}, {collection: 'cell_test'});

/**
 * Statics
 */

CellSchema.statics = {
	/**
	 * Find cell with LAC and CELL; Alternatively, LAC16 and CELL16
	 * 
	 * @param {Number} lac
	 * @param {Number} cell
	 * @param {Boolean} isHEX
	 * @param {Function} fn
	 * 
	 * @api public
	 */

	findByLacAndCell: function(lac, cell, fn){
		//var criteria = isHEX ? {LAC16: lac, CELL16: cell} : {LAC: lac, CELL: cell};

		this
			.find({LAC: lac, CELL: cell})
			.exec(fn);
	}
}

var Cell = mongoose.model('Cell', CellSchema);



