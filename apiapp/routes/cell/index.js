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

//search the cell with LAC and CELL number: /cell
app.get(base, search);

//search nearest cells with LNG, LAT and Dis: /cell/near
app.get('/cell/near', searchNearest);

//predefined hex radix
var HEX_RADIX = 16

//predefine page size
var PAGE_SIZE = 10;


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
	memcached.get(cacheKeyForCell(req), function(err, data){
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

				//process result, remove the 'loc' field
				cells.forEach(function(cell){ delete cell.loc; });
				//output the result
				res.json(cells);

				/**
				 * After sent the contents, cache them in memcached.
				 *
				 * Heads up: the cells include mongoose model objects, but after adding to cache
				 * it just change to plain object.
				 * So no more process here.
				 * Set cache item never expired.
				 */
				memcached.set(cacheKeyForCell(req), cells, 0, function(err){
					//todo:
					//handle error, not decided how to do it yet...
				});
			});
		}

	});
	
}

/**
 * Search nearest cells with longitude, latitude and distance
 *
 * To do:
 * Now this method just support search the first 10 nearest cells. We will do paging on results...
 */

function searchNearest(req, res){
	//sanitize, all parameters should be number
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var dis = parseFloat(req.query.dis);

	//validate params
	if (isNaN(lng) || isNaN(lat) || isNaN(dis)){
		return res.send('parameter error');
	}

	//try to hit cache first
	memcached.get(cacheKeyForNearest(req), function(err, data){
		//to modify
		if (err) throw err;

		if (data){
			//for debug, to delte
			data.cache = true;

			res.json(data);

		}else{
			//search nearest cells
			Cell.findNearestCells(lng, lat, dis, PAGE_SIZE, function(err, cells){
				if (err) return res.send('internal error');

				if (cells.results.length == 0) return res.send('No result');

				//process result
				//remove the diagnose info
				//create the output json object with default value
				var outputJson = {};
				outputJson.count = 0;
				outputJson.results = [];

				//assign value to the output object
				outputJson.count = cells.results.length;
				cells.results.forEach(function(result){
					delete result.obj.loc;

					outputJson.results.push(result.obj);
				});

				//already get the output json object, output it!
				res.json(outputJson);

				//after send the data, set cache
				memcached.set(cacheKeyForNearest(req), outputJson, 0, function(err){
					//todo:
					//handle error, not decided how to do it yet...
				});

			});
		}

	});

}

// Todo:
// We can unify the cache fecth interface and use same function to generate the cache key!

/**
 * Compose key in memcached for cell search
 */

function cacheKeyForCell(req){
	var key = req.path + ' ' + JSON.stringify({lac: req.query.lac, cell: req.query.cell});

	return encodeURIComponent(key);
}

/**
 * Compose key in memcached for finding nearest cells
 */

function cacheKeyForNearest(req){
	var key = req.path + ' ' + JSON.stringify({lng: req.query.lac, lat: req.query.lat, dis: req.query.dis});

	return encodeURIComponent(key);
}