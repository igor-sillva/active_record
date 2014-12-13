var Base = require('../index').Base;

module.exports = Phone

Base.extend(Phone, Base);
function Phone (attributes){
	this.initialize(attributes);
	this.validate_presence_of('number');
	this.validate_presence_of('user_id');
	this.validate_length_of('number', {is: 10});

	this.after_destroy(function (response, record){
		console.log("Phone #%s destroyed", record.get('id'));
	})
}
Phone.belongs_to('user');
