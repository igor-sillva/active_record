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
// user = User.create({name: "", password: "1234567891"})
// User.first()
// User.last()

// User.delete_all()
// User.delete("36")
/*
*	Close connection with Database
*/
setTimeout(function() {
	Base.close_connection();
}, 1000);


function Errro (){
	this.messages =  {},
	this.add = function (item, message){
		if (!Array.isArray(this.messages[item])) this.messages[item] = [];
		this.messages[item].push(message);
	}
}

function Test (){
	this.prototype.errors = new Errro
}

function B(){
	Test.call(this);
}

inherits = require('util').inherits;
inherits(U, B)
function U(){}
U.super_()

a = new U
b = new U

a.errors.add("name", "Is too long")
a.errors.add("name", "Is ugly")
a.errors.add("password", "Lol")

b.errors.add("name", "MotherFucher")

console.log(a.errors.messages)
console.log(b.errors.messages)
