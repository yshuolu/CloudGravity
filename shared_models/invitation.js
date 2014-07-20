/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Invitation schema
 */

var InvitationSchema = Schema({
	code: String
}); 

//
var User = mongoose.model('Invitation', InvitationSchema);