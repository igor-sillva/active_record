var ActiveRecord = require('../lib/base')
	,	inherits = require('util').inherits

module.exports = User

inherits(User, ActiveRecord)
function User (){
	this.attr_accessor(arguments);
}
User.super_();