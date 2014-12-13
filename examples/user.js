var Base = require('../index').Base;
/* Exports the module */
module.exports = User
/* Extends the module to ActiveRecord.Base */
Base.extend(User, Base);
/* Create the Class */
function User (attributes){
	/* Initialize the instance variables */
	this.initialize(attributes);
	/* Validations */
	this.validates('name', {
		presence: true,
		length: {
			minimum: 4,
			maximum: 25
		}
	});
	this.validate_presence_of('password', { on: 'create' });
	this.validate_length_of('password', { minimum: 5 });
	this.validate_format_of('name', { 'with': /[a-zA-Z]/g, message: "only letters" });
	/* Has Secure Password */
	this.has_secure_password();
	/* Callbacks */
	this.after_destroy(function show_message(response, record){
	 	console.log("User #%s destroyed.", record.id);
	});
}
/* Configure the model */
User.fields('name', 'password', 'created_at', 'updated_at');
/* Configure the Associations */
User.has_many('phones', {
	dependent: 'delete'
});
