var ActiveRecord = require('../lib/base')
	,	inherits = require('util').inherits

module.exports = Phone

inherits(Phone, ActiveRecord)
function Phone (){
	this.attributes(arguments[0]);
}
Phone.super_();
Phone.belongs_to('user')

Phone.validate_presence_of('number')
Phone.validate_length_of('number', {minimum: 10, maximum: 10})