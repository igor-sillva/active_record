console.log("\033[1;31mH4CK3RS \033[1;30mD0N’T \033[1;34mT35T\033[0m !!!");
/*
*	Require
*	-> ActiveRecord.Base
*/
var Base = require('../lib/base');
/**
*	Configure your Inflections
*/
var Inflections = require('./pt-BR');
/*
*	Configure the connection
*/
Base.configure_connection('./database.json');
/*
*	Establish the connection
*/
Base.establish_connection();
/*
*	Require the modules
*/
var User  = require('./user.js');
var Phone = require('./phones.js');
/*
*	TEST
*/
// phone = Phone.create({number: '6523123131', user_id: 102});
// for (i=0; i<100;i++)
// user = new User({
// 	name: 'Akrata',
// 	password: "@kr@asdasd"
// }).save()

User.find('last', function (user){
	var user = user[0];
	user.phones(function (phones){
		if (phones[0]) phones[0].update_attributes({number: '6612312312'});
		if (phones.length==10) user.destroy();
	})
	.create({
		number: '6599999999'
	})
	user.update_attributes({password: 'Aqdwsda'});
	// setTimeout(function (){
	// 	User.delete(user.get('id'))
	// 	User.destroy(user.get('id'))
	// }, 2000)
})
// User.join('phones', console.log)
/*
*	Close connection with Database
*/
setTimeout(function() {
	Base.close_connection();
}, 1000);
