# ActiveRecord Nodejs

Simplify yours queries, transactions, relations, etc.
Compatible with: (mysql, postgresql, sqlite3)

## VERSION
	
	0.0.4

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

	ActiveRecord.establish_connection()
```
	

Create a model:

``` js
	var ActiveRecord = require('active_record')
		,	inherits = require('util').inherits

	module.exports = Model

	inherits(Model, ActiveRecord)
	function Model (options){
		this.attr_accessors(options);
	}

	Model.super_() // Class methods
```

## Usage

``` js

	for( i in [1,2,3])
		Model.create({ name: 'Foo', password: 'Bar' }, function(data){ ... })

	Model.destroy(1, function(data){ ... })
	Model.update(2, {name: 'Bar', password: 'Foo'}, function(data){ ... })

	
	Model.find([1,2,3], function(data){ ... })
``` 

## API

See the [API documentation](https://github.com/3kg4kR/active_record/wiki) in the wiki. 

## License

GPLv3