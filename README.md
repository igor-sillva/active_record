# ActiveRecord Nodejs

Simplify yours queries, transactions, relations, etc.
Compatible with: (mysql, postgresql, sqlite3)

[![Build Status](https://travis-ci.org/3kg4kR/active_record.svg?branch=master)](https://travis-ci.org/3kg4kR/active_record)

## VERSION
	
	0.0.6

## Synopsis

Configure Connection:

```js
	var ActiveRecord = require('active_record');

	ActiveRecord.configure_connection({
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
	ActiveRecord.establish_connection()
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
	var ActiveRecord = require('active_record')
		,	inherits = require('util').inherits

	module.exports = Model

	inherits(Model, ActiveRecord)
	function Model (options){
		this.attributes(options);
	}

	Model.super_() // Class methods

	// Configure the Associations
	Model.has_many('phones') // Create the method `Model.prototype.phones()`

	// Configure the Callbacks
	Model.on('before_create', function (data){
		if (data.role_id == 1){
			console.log("Error on create this user...")
			return this.response_callback(false);
		}	
		return this.response_callback(true);
	})

	Model.on('before_destroy', function (data){
		if (data.id != 1){
			return this.response_callback(true);
		}	
		return this.response_callback(false);
	})
```

Example:
``` js
	// users_controller.js
	Model.create({ name: 'Foo', password: 'Bar' }, function(data){ ... })
	Model.destroy(1, function(data){ ... })
	Model.update(2, {name: 'Bar', password: 'Foo'}, function(data){ ... })	
	Model.find([1,2,3], function(data){ ... })
	Model.where("name = 'foo'", function(data){ ... })

	// HasMany Example
	Model.find(1, function (data){
		model = new Model(data[0]);
		model.phones(function (phone, Phone){
			if (phone.length == 1)
				phone.update_attributes({foo: `bar`})
			Phone.all(function (data){
				console.log(data);
			})	
		})	
	})


	/** Concat the functions **/
	Model
	.select('name')
	.where('name')
	.in(['a', 'b', 'c'])
	.and('password LIKE ?')
	.or('id > ?')
	.order('id DESC')
	.limit(10)
	.offset(10)
	.group('name')
	.execute(['xza', 1], function (data){
		console.log
	})

	/** Is like this **/
	Model.find({
		select: 'name',
		conditions: {
			where: 'name',
			in: ["'a'", "'b'", "'c'"]
		},
		and: 'password LIKE ?',
		or: 'id > ?',
		order: 'id DESC',
		limit: 10,
		offset: 10,
		group: 'name'
	}, ['xza', 1], function (data){
		console.log(data)
	})
``` 

## API

See the [API documentation](https://github.com/3kg4kR/active_record/wiki) in the wiki. 

## License

GPLv3