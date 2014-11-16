# ActiveRecord Nodejs

Simplify yours queries, transactions, relations, etc.
Compatible with: (mysql, postgresql, sqlite3)

[![Build Status](https://travis-ci.org/3kg4kR/active_record.svg?branch=master)](https://travis-ci.org/3kg4kR/active_record)

## VERSION

	0.1.3

## Synopsis

Configure Connection:

```js
var ActiveRecord = require('active_record');

ActiveRecord.Base.configure_connection({
	driver: 'mysql',
	user: 'root',
	password: '',
	port: 3306,
	hostname: 'localhost',
	database: 'chat',
	pool: true
})
```

Establish the connection
```js
ActiveRecord.Base.establish_connection()
```

Configure using a Object or a JSON file.

```json
/* database.json */
{
  	"dev": {
    	"driver": "mysql",
	    "hostname": "localhost",
	    "port": "3306",
		"user": "root",
	    "password": "",
	    "database": "chat"
  	},

  	"test": {
	    "driver": "sqlite3",
	    "filename": "./database"
  	},

  	"prod": {
	    "driver": "pg",
	    "user": "test",
	    "password": "test",
	    "host": "localhost",
	    "database": "mydb"
  	}
}
```

## Usage

Create a model:

``` js
// user.js
/*
*	Require
*	-> ActiveRecord.Base # require('active_record').Base
*/
var ActiveRecord = require('active_record');
/* Exports the module */
module.exports = User
/* Extends the module to new ActiveRecord.Base */
ActiveRecord.Base.extend_to(User)
/* Create the Class
*	Obs: -> Singular name
*/
function User (){
	// Initialize the methods!!!
	Base.initialize_instance_variables.call(this); // Don't Forget!!!
	/* Instance Methods:
	*	-> attributes
	*	-> save
	*	-> update_attributes
	*	-> destroy
	*	-> Validations
	*	-> Callbacks
	*/
	/* var user = new User({name: 'foo', password: 'bar'})
	*	console.log(user.name) # foo
	*	user.save()
	*	user.destroy() # RecordNotFound.
	*/
	this.attr_attributes(arguments[0]);
	/* Configure the Validations
	*	-> validate_presence_of
	*	-> validate_uniqueness_of * FUCK THE ASYNCRONOUS *
	*	-> validate_length_of
	*	-> validate_numericality_of
	*	-> validate_inclusion_of
	*	-> validate_exclusion_of
	*	-> validate_format_of
	*	-> validates(item, validations)
	*	-> validates_with
	*/
	this.validates('name', {
		presence: true,
		length: { minimum: 6, maximum: 25 },
		exclusion: { in: ["root"] },
		format: { with: /[a-Z]g/,  message: "only letters" }
	})

	this.validate_presence_of('password');
	this.validate_length_of('password', {minimum: 5});
	this.validate_numericality_of('password');

	this.has_secure_password(); // Call this function after all validations

	/* Configure the Callbacks
	*	-> before_create
	*	-> before_update
	*	-> before_destroy and delete
	*   =================
	*	-> after_create
	*	-> after_update
	*	-> after_destroy and delete
	*/
	this.after_destroy(function show_message(user){
	 	console.log("User #%s destroyed.", user);
	})
}
/*	Class Methods:
*		Actions: 					*	Calculations:
*			-> create 				*		-> count
*			-> update 				*		-> average - alias avg
*			-> update_all 			*		-> minimum - alias min
*			-> destroy 				*		-> maximum - alias max
*			-> destroy_all 			*		-> sum
*
*		Finders:
*			-> find
*			-> first
*			-> last
*			-> all
*			-> where
*			-> exists
*			-> find_by_sql
*			-> join
*/
/* Configure the model
*	-> table_name_prefix (default = '')
*	-> table_name  (defalt = Class.name.underscore().pluralize())
*	-> primary_key (default = 'id')
*	-> foreign_key (default = null)
*/
User.table_name = 'users';
/* Configure the Associations
*	-> belongs_to
*	-> has_one
*	-> has_many
*	-> has_many_to_many
*/
User.has_many('phones');
```

Example:
``` js
User.create({ name: 'Foo', password: 'Bar' }, function(data){ ... })

User.destroy(1, function(data){ ... })

User.update(2, {name: 'Bar', password: 'Foo'}, function(data){ ... })

User.find([1,2,3], function(data){ ... })

User.where("name = 'foo'", function(data){ ... })

// HasMany Example
User.find(1, function (user){

	user[0].phones(function (phone, Phone){
		if (phone.length == 1)
			phone[0].update_attributes({foo: `bar`})
		Phone.all(function (data){
			console.log(data);
		})
	})
	.create({
		number: "9999-9999"
	})

})
```

More Examples:

```js
var user = new User();
user.set('name', 'Foo');
user.set('password', '12345');
user.save() // error!
console.log(user.errors.full_messages);

// clear the errors
user.errors.clear
user.set('name', 'Akrata')
user.save()
console.log(user.errors.full_messages);
```

## API

See the [API documentation](https://github.com/3kg4kR/active_record/wiki) in the wiki.

## License

GPLv3
