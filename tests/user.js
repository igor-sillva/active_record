var ActiveRecord = require('../lib/base')
	,	inherits = require('util').inherits

module.exports = User

inherits(User, ActiveRecord)
function User (){
	this.attributes(arguments[0]);
}
User.super_();
User.set('table_name', 'users');
User.belongs_to('phones')
User.has_many('phones')
