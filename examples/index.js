console.log("\033[1;31mH4CK3RS \033[1;30mD0N’T \033[1;34mT35T\033[0m !!!");
/* Require -> ActiveRecord.Base */
var ActiveRecord = require('../index');
/* Configure ActiveRecord */
ActiveRecord.configure('default_models_path', '.');
/* Configure your ActiveSupport.Inflections */
// var Inflections = require('./pt-BR');
/* Configure the connection */
ActiveRecord.Base.connection.set('env', 'prod');
ActiveRecord.Base.configure_connection('./database.json');
/* Establish the connection */
ActiveRecord.Base.establish_connection();
/* CREATE TABLES */
var drop_tables = false;
if (drop_tables){
	var driver = ActiveRecord.Base.connection.get('driver');
	var auto_increment = driver == 'sqlite3' ? 'AUTOINCREMENT' : driver == 'postgres' ? '' : 'auto_increment';
	ActiveRecord.Base.connection.conn.query("drop table if exists phones");
	ActiveRecord.Base.connection.conn.query("drop table if exists users");
	ActiveRecord.Base.connection.conn.query("create table if not exists users (\
		id integer primary key "+ auto_increment +", name varchar(50) not null,\
		password varchar(50) not null, updated_at timestamp not null,\
		created_at timestamp not null\
	)");
	ActiveRecord.Base.connection.conn.query("create table if not exists phones (\
		id integer primary key "+ auto_increment +", number varchar(11) not null,\
		user_id integer, updated_at timestamp not null,\
		created_at timestamp not null, foreign key(user_id) references users(id) on update cascade on delete set null\
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
User.all(function (err, users){
	console.log(users.length)
});
/* Close connection with Database */
setTimeout(function() {
	ActiveRecord.Base.close_connection();
}, 3000);
