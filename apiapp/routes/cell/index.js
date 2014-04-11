/**
 * Module dependencies.
 */

var app = require('../../app'),
	path = require('path'),
	base = '/' + path.basename(__dirname); //get last component, aka controller name

/**
 * Set up the routing within this namespace
 */
app.get(base, search);


/**
 * Search cell with criteria and return cell info
 */

function search(req, res){
	res.send('hello cell\n');
}