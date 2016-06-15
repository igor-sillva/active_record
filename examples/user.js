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
		uniqueness: true,
		length: { minimum: 4, maximum: 25 },
		exclusion: { in: ['root', 'admin'] },
	});
	this.validate_presence_of('password', { on: 'create' });
	this.validate_length_of('password', { minimum: 5 });
	/* Has Secure Password */
	this.has_secure_password({ validations: false });
	/* Callbacks */
	this.after_destroy(function (){
	 	console.log("User #%s destroyed.", this.get('id'));
	});

	this.after_create(function (){
		console.log("User #%s has been created.", this.get('id'));
	})
}
/* Configure the model */
User.fields('name', 'password', 'created_at', 'updated_at');
/*  Configure the Associations*/
User.has_many('phones', {
	dependent: 'delete'
});
