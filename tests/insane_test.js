console.log("\033[1;31mH4CK3RS \033[1;30mD0N’T \033[1;34mT35T\033[0m !!!");
/*
*	Require
*	-> ActiveRecord.Base
*/
console.log("\033[1;36m[INFO]", "Requiring ActiveRecord.Base", "\033[0m");
var Base = require('../lib/base');
/**
*	Configure your Inflections
*/
console.log("\033[1;36m[INFO]", "Configuring Inflections", "\033[0m");
var Inflections = require('./pt-BR');
/*
*	Configure the connection
*/
console.log("\033[1;36m[INFO]", "Configuring Connection", "\033[0m");
Base.configure_connection('./database.json');
console.log("\033[0m", Base.connection.settings, "\033[0m");
/*
*	Establish the connection
*/
console.log("\033[1;36m[INFO]", "Establish the connection", "\033[0m");
Base.establish_connection();
console.log("\033[0m\t\\-", Base.connection.connected(), "\033[0m");
/*
*	Require the modules
*/
console.log("\033[1;36m[INFO]", "Require modules", "\033[0m");
var User  = require('./user.js');
var Phone = require('./phones.js');
console.log("\033[0m\t\\-", User, "\033[0m");
console.log("\033[0m\t\\-", Phone, "\033[0m");
/*
*	TEST
*/
console.log("\033[1;33m[WARNING] BEGIN TEST", "\033[0m");
/*
*	FINDERS TEST
*/
setTimeout(function() {
	console.log("\033[1;33m[WARNING]", "Finders test", "\033[0m");
	User.find('first', _data)
	User.find('last', _data)
	User.find('all', _data)
	User.all(_data)
	User.where("name = ?", ["Akrata"], _data)
	User.exists({name: 'Akrata'}, _data)
	User.join('phones', _data)
	User.find_by_sql("SELECT * FROM users WHERE name LIKE '%a'", _data)
}, 1000);
/*
*	CALCULATIONS TEST
*/
setTimeout(function() {
	console.log("\033[1;33m[WARNING]", "Calculations test", "\033[0m");
	User.count('*', _data)
	User.average('id', _data)
	User.minimum('name', _data)
	User.maximum('id', _data)
	User.sum('id', _data)
}, 2000);
/*
*	Actions TEST
*/
setTimeout(function() {
	console.log("\033[1;33m[WARNING]", "ACTIONS test", "\033[0m");
	// for (i=0; i<9;i++)
	// 	new User({
	// 		name: 'Akrata',
	// 		password: "@kr@t@"
	// 	}).save()

	User.last(function (user){
		user = user[0];
		if(user){
			User.update(user.get('id'), {name: 'Joaoaa'});
			setTimeout(function (){
				User.delete(user.get('id'))
				User.destroy(user.get('id'))
			}, 2000)
		}
	})
}, 4000)
/*
*	Associations TEST
*/
setTimeout(function() {
	console.log("\033[1;33m[WARNING]", "Associations test", "\033[0m");
	Phone.belongs_to('user');
	Phone.find('last', function (phone){
		if(phone[0]) phone[0].user(_data)
	})
	User.has_many('phones');
	User.first(function (user){
		if(user[0]) user[0].phones(_data)
	})
}, 10000);
/*
*	Close connection with Database
*/
console.log("\033[1;33m[WARNING]", "Close connection after 10000ms", "\033[0m");
setTimeout(function() {
	Base.close_connection();
}, 100000);


var _data = function _data (data){
	for (i=0; i<1;i++){
		if (data[i]) console.log(data[i]);
	}
}
