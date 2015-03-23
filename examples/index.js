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
ActiveRecord.Base.establish_connection(function (){
	/* Require the modules */
	var User  = require('./user.js');
	var Phone = require('./phone.js');

	/* TEST */
	User.create({
		name: 'oo\'o\'\'\\\'fo',
		password: 'dsa\'das'
	})

	User.where({conditions: {name_like: '%foo%'}, order: 'id'})

	User.all(function (err, users){
		var first = users[0];

		console.log(first.to_json())
		first.update_attributes({name: 'Jesus Cristo\\\''})
		console.log(first.to_json())
		first
		.phones(function (err, phones){
			console.log(phones.map(function (phone){ return phone.to_json() }))
		})
		// .create({
		// 	number: '2199349212'
		// })
		User.all()
		User.update(first.id, {name: 'gooAsd'})
		User.destroy(first.id + 1);
		User.find(first);
	});
});
/* CREATE TABLES */
require('./create_table').createTable();



/* Close connection with Database */
setTimeout(function() {
	ActiveRecord.Base.close_connection();
}, 3000);
