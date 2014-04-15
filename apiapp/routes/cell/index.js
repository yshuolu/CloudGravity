/**
 * Module dependencies.
 */

//init models
require('./cell');

var app = require('../../app'),
	path = require('path'),
	base = '/' + path.basename(__dirname), //get last component, aka controller name
	mongoose = require('mongoose'),
	Cell = mongoose.model('Cell');
/**
 * Set up the routing within this namespace
 */
app.get(base, search);


/**
 * Search cell with criteria and return cell info
 */

function search(req, res){
	/**
	 * There are two kinds of query. One is decimal lac and cell, which both of params should
	 * be number; and another one is hex lac and cell, which both of params should be string.
	 * Do sanitize and validation here!
	 */

	if (!req.query.hex) {
		//sanitize, all params should be number
		req.query.lac = parseInt(req.query.lac);
		req.query.cell = parseInt(req.query.cell);
		req.query.hex = false;

		//check if params are number
		if ( isNaN(req.query.lac) || isNaN(req.query.cell) ) {
			//param error
			return res.send('parameter error');
		}
	}else{
		//sanitize, all params should be string
		req.query.lac = req.query.lac.toString().toUpperCase();
		req.query.cell = req.query.cell.toString().toUpperCase();
		req.query.hex = true;
	}

	
	Cell.findByLacAndCell(req.query.lac, req.query.cell, req.query.hex, function(err, cells){
		if (err) return res.send('internel error');

		if (cells.length == 0) return res.send('No result');

		res.json(cells);
	});
	
}