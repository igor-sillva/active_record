var Base = require('../lib/base');

module.exports = Phone

Base.extend(Phone, Base)
function Phone (){
	this.attributes(arguments[0]);
	this.validate_presence_of('number');
	this.validate_presence_of('user_id')
	this.validate_length_of('number', {minimum: 10, maximum: 10})
}
Phone.belongs_to('user')
