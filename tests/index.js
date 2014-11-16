console.log("\033[1;31mH4CK3RS \033[1;30mD0N’T \033[1;34mT35T\033[0m !!!");
/*
*	Require
*	-> ActiveRecord.Base
*/
var Base = require('../lib/base');
var ActiveSupport = require('../lib/active_support')
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
*	CREATE TABLES
*/
Base.connection.conn.query("create table if not exists users (\
	id int(11) not null auto_increment,\
	name varchar(50) not null,\
	password varchar(50) not null,\
	primary key(id)\
)");
Base.connection.conn.query("create table if not exists phones (\
	id int(11) not null auto_increment,\
	number varchar(11) not null,\
	user_id int(11),\
	primary key(id),\
	foreign key(user_id) references users(id) on delete cascade on update cascade\
)");
/*
*	Require the modules
*/
var User  = require('./user.js');
var Phone = require('./phones.js');
/*
*	TEST
*/
// var phone = Phone.create({number: '6523123131', user_id: 1002});

var user = new User();
user.set('name', 'Foo');
user.set('password', '12345');
user.save() // error!
console.log(user.errors.full_messages);

// clear the errors
user.errors.clear()
user.set('name', 'Akrata')
user.save()
console.log(user.errors.full_messages);

/*
*	Close connection with Database
*/
setTimeout(function() {
	Base.close_connection();
}, 2000);
