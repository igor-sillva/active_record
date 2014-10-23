/*
*	Require
*	-> ActiveRecord.Base # require('active_record').Base
*/
var Base = require('../lib/base');
/* Exports the module */
module.exports = User
/* Extends the module to new ActiveRecord.Base */
Base.extend_to(User)
/* Create the Class
*	Obs:
*	-> Singular name
*/
function User (){
	/* Instance Methods:
	*	-> attributes
	*	-> save
	*	-> update_attributes
	*	-> destroy
	*	-> Validations
	*	-> Callbacks
	*/
	/* var user = new User({name: 'foo', password: 'bar'})
	*	console.log(user.name) # foo
	*	user.save()
	*	user.destroy() # RecordNotFound.
	*/
	this.attributes(arguments[0]);
	/* Configure the Validations
	*	-> validate_presence_of
	*	-> validate_uniqueness_of * FUCK THE ASYNCRONOUS *
	*	-> validate_length_of
	*	-> validate_numericality_of
	*	-> validate_inclusion_of
	*	-> validate_exclusion_of
	*	-> validate_format_of
	*/
	// this.validate_uniqueness_of('name');
	this.validate_presence_of('name', {on: "create"});
	this.validate_presence_of('password');
	// this.validate_inclusion_of('name', {in: ["Akrata"]})
	// this.validate_exclusion_of('name', {in: ["root", "admin"]})
	this.validate_length_of('name', {
		minimum: 6,
		maximum: 50
	});
	this.validate_length_of('password', {minimum: 5});
	// this.validate_format_of('name', {'with': /[a-zA-Z]/g, message: "only letters"});
	// this.validate_numericality_of('password', {even: true});
	this.has_secure_password(); // Call this function after all validations
	/* Configure the Callbacks
	*	-> before_create
	*	-> before_update
	*	-> before_destroy and delete
	*   =================
	*	-> after_create
	*	-> after_update
	*	-> after_destroy and delete
	*/
	this.on('after_destroy', function _show_message(data){
		console.log("User #%s destroyed.", data);
	})
}
/*	Class Methods:
*		Actions: 					*	Calculations:
*			-> create 				*		-> count
*			-> update 				*		-> average - alias avg
*			-> update_all 			*		-> minimum - alias min
*			-> destroy 				*		-> maximum - alias max
*			-> destroy_all 			*		-> sum
*
*		Finders:
*			-> find
*			-> first
*			-> last
*			-> all
*			-> where
*			-> exists
*			-> find_by_sql
*			-> join
*/
/* Configure the model
*	-> table_name_prefix (default = '')
*	-> table_name  (defalt = Class.name.underscore().pluralize())
*	-> primary_key (default = 'id')
*	-> foreign_key (default = null)
*/
User.table_name = 'users';
/* Configure the Associations
*	-> belongs_to
*	-> has_one
*	-> has_many
*	-> has_many_to_many
*/
User.has_many('phones', {
	dependent: 'destroy'
});
