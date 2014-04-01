var ActiveRecord = require('../lib/base');

ActiveRecord.configure_connection({
	driver: 'mysql',
	user: 'root',
	password: '',
	port: 3306,
	hostname: 'localhost',
	database: 'search',
	pool: true
})
//.establish_connection();

/*
*	Modules
*/
var User = require('./user.js');

User.all();

console.log(User)