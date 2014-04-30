var ActiveRecord = require('../lib/base')
	,	inherits = require('util').inherits

module.exports = Phone

inherits(Phone, ActiveRecord)
function Phone (){
	this.attributes(arguments[0]);
}
Phone.super_();
Phone.belongs_to('user')