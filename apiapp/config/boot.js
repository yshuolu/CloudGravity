/**
 * Module dependencies.
 */

var express = require('express'),
	path = require('path'),
	fs = require('fs');


module.exports = function(app){
	/**
	 * Boot all controllers
	 */
	var controllersPath = path.join(__dirname, '../routes');

	fs.readdirSync(controllersPath).forEach(function(dir){
		var filePath = path.join(controllersPath, dir);

		if ( fs.statSync(filePath).isDirectory() ) {
			//init controller
			//let the controller itself setup the routing with its namespace
			require( path.join(controllersPath, dir) );
		}

	});
}