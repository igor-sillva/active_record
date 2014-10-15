/*
*	Require
*	-> ActiveRecord.Base
*/
var Base = require('../lib/base');
/**
*	Configure your Inflections
*/
// var Inflections = require('./pt-BR');
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
var User = require('./user.js');
// var Phone= require('./phones.js')
/*
*
*/
// User.all(function(users){
// 	// console.log(users)
// 	users.forEach(function(user){
// 		console.log(user)
// 		// user.destroy()

// 		// user.phones().create({
// 		// 	user_id: user.id,
// 		// 	number: "6533083315"
// 		// })
// 		// user.update_attributes({name: 'Kauak'})
// 		// console.log(User.errors.full_messages());
// 		user.phones(function(phones, Phone){
// 			console.log(phones)
// 			// phones[0].user(function (user){
// 			// 	console.log(user[0])
// 			// })
// 			// console.log(user)
// 		})

// 	})
// })
user = User.create({name: "KikoOOo", password: "1234567891"})
user1 = User.create({name: "", password: ""})
user2 = User.create({name: "IgorMichael", password: "1234567892"})
console.log(user.errors.full_messages)
console.log(user1.errors.full_messages)
console.log(user2.errors.full_messages)
// User.all({
// 	order: 'id DESC',
// 	limit: 3
// }, console.log)
User.last(function (user){
	phone = user[0]
	.phones()
	.create({
		number: "2321312312"
	});
})
// User.delete_all()
// User.delete("36")
/*
*	Close connection with Database
*/
setTimeout(function() {
	Base.close_connection();
}, 1000);
