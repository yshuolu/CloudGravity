/**
 * Module dependencies.
 */

//init models
require('./cell');

var app = require('../../app'),
	path = require('path'),
	base = '/' + path.basename(__dirname), //get last component, aka controller name
	mongoose = require('mongoose'),
	Cell = mongoose.model('Cell'),
	memcached = app.memcached;

/**
 * Set up the routing within this namespace
 */
app.get(base, search);

//predefined hex radix
var HEX_RADIX = 16


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

	}else{
		//sanitize, all params should be string,
		//and change the hex string to integer
		req.query.lac = parseInt(req.query.lac.toString().toUpperCase(), HEX_RADIX);
		req.query.cell = parseInt(req.query.cell.toString().toUpperCase(), HEX_RADIX);
	}

	//check if params are number
	if ( isNaN(req.query.lac) || isNaN(req.query.cell) ) {
		//param error
		return res.send('parameter error');
	}

	//try to hit the cache first
	memcached.get(createCacheKey(req), function(err, data){
		if (err) throw err;

		if (data){
			//hit cache!!

			//for debug
			data[0]['cache'] = 1;
			
			res.json(data);

		}else{
			//did not hit the cache, query database now
			Cell.findByLacAndCell(req.query.lac, req.query.cell, function(err, cells){
				if (err) return res.send('internal error');

				if (cells.length == 0) return res.send('No result');

				res.json(cells);

				/**
				 * After sent the contents, cache them in memcached.
				 *
				 * Heads up: the cells include mongoose model objects, but after adding to cache
				 * it just change to plain object.
				 * So no more process here.
				 * Set cache item never expired.
				 */
				memcached.set(createCacheKey(req), cells, 0, function(err){
					//todo:
					//handle error, not decided how to do it yet...
				});
			});
		}

	});
	
}

/**
 * Compose key in memcached for this service
 */

function createCacheKey(req){
	var key = req.path + ' ' + JSON.stringify({lac: req.query.lac, cell: req.query.cell});

	return encodeURIComponent(key);
}