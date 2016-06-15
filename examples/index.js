var ActiveRecord = require('../index');
ActiveRecord.Base.configure_connection('./database.json');
ActiveRecord.Base.establish_connection();
/* Exports */
exports.User = User;
exports.Phone = Phone;
/* Extends */
ActiveRecord.Base.extend(User, ActiveRecord.Base);
ActiveRecord.Base.extend(Phone, ActiveRecord.Base);
/* Config Models */
function User (){
	this.initialize(arguments[0]);
	this.validates('name', {
		presence: true,
		length: { minimum: 4 }
	});
	this.has_secure_password({ validations: false });
	this.validate_uniqueness_of('name');
}

function Phone (){
	this.initialize(arguments[0]);
	this.validate_presence_of('number');
	this.validate_length_of('number', { is: 10 });
	this.validate_presence_of('user_id');
}

User.has_many('phones', { dependent: 'delete' });

// User.all(function (error, users){
// 	console.log(users.map(function (user){
// 		return user.to_json()
// 	}));
// 	ActiveRecord.Base.close_connection();
// })

var user = new User();
user.set('name', 'IgoraaX');
user.set('password', 'asdasdsad');
user.save(function (){
	User.last(function (error, user){
		console.log(user[0].to_json());
		ActiveRecord.Base.close_connection()
	})
})

