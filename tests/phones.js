var Base = require('../lib/base');

module.exports = Phone

Base.extend_to(Phone);
function Phone (){
	this.attributes(arguments[0]);
	this.validate_presence_of('number');
	this.validate_presence_of('user_id');
	this.validate_length_of('number', {is: 10});
}
Phone.table_name = "phones";
Phone.belongs_to('user');
