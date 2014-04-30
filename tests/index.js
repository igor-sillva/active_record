var ActiveRecord = require('../lib/base');
var _ = require('./helpers.js');

ActiveRecord.configure_connection('./database.json');
ActiveRecord.establish_connection();

/*
*	Modules
*/
var User = require('./user.js');
// var Phone= require('./phones.js');



User.first(function(d){
	u = new User(d[0])
	u.phones(function (data){
		phone = data[0];
		console.log(phone);
		phone.user(function(user){
			console.log(user)
		})
	})
})

setTimeout(function() {
	ActiveRecord.close_connection();
}, 1000);