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
require('./create_table').createTable();

/* Require the modules */
var User  = require('./user.js');
var Phone = require('./phone.js');
var assert = require('assert');

/* TEST */
User.create({
	name: 'ooofo',
	password: 'dsadas'
})

User.all(function (err, users){
	console.log(users)
	// User.all()
});
User.update(1, {name: 'goo'})
// User.delete(1)
// User.destroy(1)
User.find(1)

/* Close connection with Database */
setTimeout(function() {
	ActiveRecord.Base.close_connection();
}, 3000);
