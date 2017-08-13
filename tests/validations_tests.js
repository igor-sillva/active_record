var assert = require('assert');
var test   = require('utest');
var $      = require('./helpers').Models;

test('ActiveRecord#Validations', {
	'validate_presence_of_name': function (){
		$.User.prototype.validate_presence_of('name');
		var user = new $.User();
		user.save(function (error, user){
			assert.ok(true, user.errors.any);
		});
	},

	'validate_uniqueness_of_name': function (){
		$.User.prototype.validate_uniqueness_of('name');
		var user = new $.User({name: 'Akrata'});
		user.save(function (error, user){
			console.error(user.errors.full_messages)
		});
	},

	'validate_numericality_of_password': function (){
		$.User.prototype.validate_numericality_of('password');
		var user = new $.User({ password: 'foo' });
		user.save();
		console.error(user.errors.full_messages)
	}


})

// require('./helpers').testModels(function ($){

// 	// Test of validations
// 	// Presence
// 	var PresenceTest = (function (){
// 		$.User.prototype.validate_presence_of('name');
// 		var user = new $.User();
// 		user.save();
// 		assert.ok(false, user.errors.full_messages)
// 	})()
// 	// Uniqueness
// 	var UniquenessTest = (function (){
// 		$.User.prototype.validate_uniqueness_of('name');
// 		var user = new $.User({name: 'Akrata'});
// 		user.save(function (error, user){
// 			console.error(user.errors.full_messages)
// 		});
// 	})()
// 	// Numericality
// 	var NumericalityTest = (function (){
// 		$.User.prototype.validate_numericality_of('password');
// 		var user = new $.User({ password: 'foo' });
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// Length
// 	var LengthTest = (function (){
// 		$.User.prototype.validate_length_of('password', { minimum: 16 });
// 		var user = new $.User({ password: 'foo' });
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// Format
// 	var FormatTest = (function (){
// 		$.User.prototype.validate_format_of('name', { within: '/[a-Z]/' });
// 		var user = new $.User();
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// Exclusion
// 	var ExclusionTest = (function (){
// 		$.User.prototype.validate_exclusion_of('name', { in: ['root', 'admin'] });
// 		var user = new $.User({ name: 'root' });
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// Inclusion
// 	var InclusionTest = (function (){
// 		$.User.prototype.validate_inclusion_of('name', { in: ['Zeus', 'Odin'] });
// 		var user = new $.User();
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// HasSecurePassword
// 	var HasSecurePasswordTest = (function (){
// 		$.User.prototype.has_secure_password();
// 		var user = new $.User({ password: 'foo' });
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()
// 	// Confirmation
// 	var ConfirmationTest = (function (){
// 		// $.User.prototype.validate_confirmation_of('password');
// 		var user = new $.User();
// 		user.save();
// 		console.error(user.errors.full_messages)
// 	})()

// 	setTimeout(function () { $.User.connection.disconnect() }, 5000);
// })
