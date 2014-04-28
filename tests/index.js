var ActiveRecord = require('../lib/base');
var _ = require('./helpers.js');

ActiveRecord.configure_connection('./database.json');
ActiveRecord.establish_connection();

/*
*	Modules
*/
var User = require('./user.js');

setTimeout(function() {
	ActiveRecord.close_connection();
}, 1000);