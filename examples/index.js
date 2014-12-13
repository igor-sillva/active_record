console.log("\033[1;31mH4CK3RS \033[1;30mD0N’T \033[1;34mT35T\033[0m !!!");
/* Require -> ActiveRecord.Base */
var ActiveRecord = require('../index');
/* Configure ActiveRecord */
ActiveRecord.configure('default_models_path', '.');
/* Configure your ActiveSupport.Inflections */
// var Inflections = require('./pt-BR');
/* Configure the connection */
ActiveRecord.Base.configure_connection('./database.json');
/* Establish the connection */
ActiveRecord.Base.establish_connection();
/* CREATE TABLES */
var drop_tables = false;
if (drop_tables){
	ActiveRecord.Base.connection.conn.query("drop table if exists phones");
	ActiveRecord.Base.connection.conn.query("drop table if exists users");
	ActiveRecord.Base.connection.conn.query("create table if not exists users (\
		id int(11) not null auto_increment,\
		name varchar(50) not null,\
		password varchar(50) not null,\
		updated_at timestamp not null,\
		created_at timestamp not null,\
		primary key(id)\
	)");
	ActiveRecord.Base.connection.conn.query("create table if not exists phones (\
		id int(11) not null auto_increment,\
		number varchar(11) not null,\
		user_id int(11),\
		primary key(id),\
		updated_at timestamp not null,\
		created_at timestamp not null,\
		foreign key(user_id) references users(id) on update cascade on delete set null\
	)");
	setTimeout(function() {
		ActiveRecord.Base.close_connection();
	}, 1000);
	return false;
}

/* Require the modules */
var User  = require('./user.js');
var Phone = require('./phone.js');
var assert = require('assert');

/* TEST */
var user = User.update(4057, {
	name: 'Fooo',
	password: '@kr@t@',
	password_confirmation: '@kr@t@'
})


// User.all(function (error, users){

// 	if (users.length == 0){
// 		var u = User.create({
// 			name: 'Akrata',
// 			password: 'akrata',
// 			password_confirmation: 'akrata'
// 		}).save();

// 		// assert.equal(u.errors.any, false, u.errors.full_messages);
// 	}

// 	var first_record = users[0];

// 	if (first_record){
// 		// console.log(first_record.to_json())
// 		// console.log(first_record.authenticate("akrata"))

// 		first_record
// 		// .update_attributes({
// 		// 	name: 'Akrata',
// 		// 	password: 'akrata',
// 		// 	password_confirmation: 'akrata'
// 		// })
// 		// .update_attributes({
// 		// 	name: 'Anarkhia',
// 		// 	password: 'akratas',
// 		// 	password_confirmation: 'akratas'
// 		// })

// 		first_record.phones(function (error, phones, Phone){
// 			if (phones.length <= 10){
// 				for (i=0; i<11; i++)
// 					Phone.create({
// 						number: '6699996666'
// 					})
// 			}
// 		})

// 		// first_record.destroy()

// 		// setTimeout(function (){
// 		// 	// console.log(first_record.get('phones').map(function (phone){ return phone.to_json() }) )
// 		// }, 1000)

// 		// first_record.set('name', 'Magali');

// 		// console.log(first_record.changes)
// 		// console.log(first_record.to_json())
// 	}
// })

/* Close connection with Database */
setTimeout(function() {
	ActiveRecord.Base.close_connection();
}, 1000);
