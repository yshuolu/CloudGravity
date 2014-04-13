/**
 * Module dependencies.
 */

exports.index = function(req, res){
	if (!req.user){
		//show land page
		res.render('land');
	}else{
		//show app list
	}
}