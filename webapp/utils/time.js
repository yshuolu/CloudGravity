/**
 * Module dependencies.
 */

var moment = require('moment-timezone');

exports.chinaMoment = function(date){
	//transfer date to china timezone
	return moment(date).tz('Asia/Shanghai');
}