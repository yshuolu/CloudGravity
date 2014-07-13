/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * User schema
 */

var UserSchema = Schema({
	name: { type: String, default: '' },
	email: { type: String, default: '' },
	hash: {type: String, default: '' },
	salt: {type: String, default: '' },
	trialKey: {type: String, default: ''},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

/**
 * Virtuals
 */

UserSchema
	.virtual('pass')
	.set(function(pass){
		this._pass = pass;
		this.salt = this.generateSalt();
		this.hash = this.generateHash(pass);
		
		//set user trialKey, which is just a random number as salt
		this.trialKey = this.generateSalt();
	})
	.get(function(){
		return this._pass;
	});

/**
 * Validation
 */

//name length should be at least 6 characters
UserSchema.path('name').validate(function(name){
	return ( name.length >= 1 );
}, 'name length less than 1');

//email should not be empty
UserSchema.path('email').validate(function(email){
	return email.length;
}, 'email empty');

//email should be unique
UserSchema.path('email').validate(function(email, fn){
	if (this.isNew || this.isModified('email')){
		//only check new created email
		User.find({email: email}).exec(function(err, users){
			fn( !err && users.length === 0 );
		});
	}else{
		//if it is a email in store, no need to check
		fn(true)
	}
}, 'email already exits');

//salt should not be empty
UserSchema.path('salt').validate(function(salt){
	return salt.length;
}, 'salt empty');

//hash should not be empty
UserSchema.path('hash').validate(function(hash){
	return hash.length;
}, 'hash empty');

//createdAt required
UserSchema.path('createdAt').required(true, 'createdAt should not be empty');

//updatedAt required
UserSchema.path('updatedAt').required(true, 'updatedAt should not be empty');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next){
	//password lenght should be at least 6 characters
	if ( !this.isNew || this.pass.length >= 6 ){
		next();
	}else{
		next(new Error('Invalid Password'));
	}
});

/**
 * Statics
 */
UserSchema.statics = {
	/**
	 * Find User by the email
	 *
	 * @param {String} email
	 * @param {Function} fn; fn(err, user)
	 *
	 * @api public
	 */
	findByEmail: function(email, fn){
		this
			.findOne({email: email})
			.exec(fn);
	}
}

/**
 * Methods
 */

UserSchema.methods = {
	/**
	 * Authenticate - check if password match the user
	 *
	 * @param {String} pass
	 * @return {Boolean}
	 * @api public
	 */

	authenticate: function(pass){
		return this.generateHash(pass) === this.hash;
	},

	/**
	 * Generate salt
	 *
	 * @return {String}
	 * @api public
	 */

	generateSalt: function(){
		return Math.round((new Date().valueOf() * Math.random())) + '';
	},

	/**
	 * Generate hash for password
	 *
	 * @param {String} pass
	 * @return {String}
	 * @api public
	 */

	generateHash: function(pass){
		if (!pass) return '';

		try {
			return crypto.createHmac('sha1', this.salt).update(pass).digest('hex');
		} catch (err){
			return '';
		}
	}
}

/**
 * Register this model to mongoose
 */
var User = mongoose.model('User', UserSchema);