var ActiveRecord = require('../index');
ActiveRecord.Base.connection.set('env', 'prod');
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
}

function Phone (){
	this.initialize(arguments[0]);
}

User.has_many('phones', { dependent: 'delete' });
Phone.belongs_to('user', { dependent: 'delete' });

/* Test */
// User.create({ name: 'oo\'o\'\'\\\'fo', password: 'dsa\'das' })
User.first(function (err, user){
	user[0]
	.phones(function (err, phones){
		console.log(phones.map(function (phone){ return phone.to_json()}))
		// phones[0].destroy();
	})
	.count('*', function (err, result){
		console.log(result[0].count)
	})
	.create({
		number: '6599434957'
	})

	Phone.all()
})

setTimeout(function (){
	ActiveRecord.Base.close_connection();
}, 2000)


