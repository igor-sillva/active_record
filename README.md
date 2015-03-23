# ActiveRecord Nodejs

Rails ActiveRecord inspired for Nodejs.

[![Build Status](https://travis-ci.org/3kg4kR/active_record.svg?branch=master)](https://travis-ci.org/3kg4kR/active_record)

## VERSION

    0.1.4

## Instalation
```bash
npm install active_record
```

## Setup
### Configure Connection:
```js
var ActiveRecord = require('active_record');

ActiveRecord.Base.configure_connection({
	driver: 'mysql',
	hostname: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'active_record'
	pool: true,
	'pool config': { min: 1, max: 20 }
});
```
`or`
```js
ActiveRecord.Base.connection.config({ env: 'test' }); // Set Enviroment; *Default: 'dev'
ActiveRecord.Base.configure_connection('path/to/database.json');

/* JSON file example: */
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
    "driver": "postgres",
    "user": "test",
    "password": "test",
    "hostname": "localhost",
    "database": "mydb"
  }
}
```

### Establish the connection:

```js
ActiveRecord.Base.establish_connection([callback]);
```

## Usage

### Model:
Equal to the RAILS each model is a separate file. But you can create a single connection file and configuration of models, as follows in the examples below. Takes also that the file names are singular.
`Example 1`: For each model create a separate file.
``` js
var ActiveRecord = require('active_record');
/* Exports the module */
module.exports = User
/* Extends the module to ActiveRecord.Base */
ActiveRecord.Base.extend(User, ActiveRecord.Base)
/* Create the Class */
function User (){
	/* Initialize the instance variables */
	this.initialize(arguments[0]);
	/** Validations */
	this.validates('name', {
		presence: true,
		length: { minimum: 6, maximum: 25 }
	})
	this.validate_length_of('password', {minimum: 5});
	this.has_secure_password(); /* Call this function after another validations */
}

/* Configure the model */
User.table_name = 'users';
User.fields('name', 'password'); // Create dynamics finders: User.find_by_name, etc.
/* Configure the Associations */
User.has_many('phones');
```

`Example 2`: Configuration in a single file
```js
var ActiveRecord = require('../index');
ActiveRecord.Base.configure_connection('./database.json');
ActiveRecord.Base.establish_connection();
/* Don't forget: Exports the models */
exports.User = User;
exports.Phone = Phone;

ActiveRecord.Base.extend(User, ActiveRecord.Base);
ActiveRecord.Base.extend(Phone, ActiveRecord.Base);

function User (){
	this.initialize(arguments[0]);
}

function Phone (){
	this.initialize(arguments[0]);
}

User.has_many('phones');
Phone.belongs_to('user');

ActiveRecord.Base.close_connection();
```


### CRUD:
``` js
/* Create, Update, Destroy */
User.create({ name: 'Foo', password: 'Bar' }, function(data){ ... })
User.update(2, {name: 'Bar', password: 'Foo'}, function(data){ ... })
User.destroy(1, function(data){ ... })

/* Finders */
User.find([1,2,3], function(error, data){ ... })
User.where("name = 'foo'", function(error, data){ ... })

/* Calculations */
User.count('*', function (error, data){ ... })

/** Associations
* User.has_many('phones') */
User.find(1, function (error, user){
	user[0]
	.phones(function (error, phone, Phone){
		/* Phone.belongs_to('user') */
		phone[0].user(console.log)
	})
	.create({ // @return Phone
		number: "(66)9999-9999"
	});

})

/* Callbacks */
User.before_find(function (query, values, options){ ... })
```

# API

## ActiveRecord

`ActiveRecord` Global config options

* `logger`: `Not implemented`
* `primary_key_prefix_type`:
* `table_name_prefix`:
* `table_name_suffix`:
* `pluralize_table_names`:
* `default_timezone`:
* `record_timestamps`:
* `cache_query`:
* `max_number_of_listeners`:

`Example`:
```js
var ActiveRecord = require('active_record');
ActiveRecord.configure('primary_key_prefix_type', 'table_name');
```
`or`
```js
ActiveRecord.configure({ primary_key_prefix_type: 'table_name', ... });
```

## ActiveSupport
* `Inflector`:
	`@methods`: `inflections`
		* `plural`, `singular`, `uncountable`
Example:
```js
var ActiveSupport = require('active_record').ActiveSupport;
ActiveSupport.Inflector.inflections('pt-BR', function (inflector){
	inflector.plural(/(z|r)$/i, '$1es');
});
module.exports = ActiveSupport;
```

## Base
`@alias ActiveRecord.Base`

`@methods`:
* `Base.configure_connection` alias of `Base.connection.config`
* `Base.estabilish_connection` alias of `Base.connection.connect`
* `Base.close_connection` alias of `Base.connection.disconnect`
* `Base.extend`

### configure_connection(config)
```js
Base.configure_connection('path/to/database.json')
```

### estabilish_connection()
```js
Base.estabilish_connection()
```

### close_connection()
```js
Base.close_connection()
```

### extend(destination, [source])
```js
module.exports = User
Base.extend(User, Base)
function User(){
    // ...
}
```

## Class Methods
## Finders
`@methods`: `find`, `first`, `last`, `all`, `exists`, `where`, `join`, `find_by_sql`, `find_by_id`, `fields`.

### find(id, [conditions], [callback])
`@conditions` operators: `is`, `is_not`, `like`, `not_like`, `gt`, `gte`, `lt`, `lte`,
`between`, `exists`, `not_exists`, `some`, `all`, `in`, `not_in`.

Example:
```bash
{
	name_like: 'foo',
	password_is_not: null
	roleId: 1 // If the field is with underscore (role_id), write in camelcase
	createdAt_between: [new Date(), new Date()]
}
```

```js
User.find(1, function (error, record){ ... });
//> SELECT * FROM users WHERE `id` = 1

User.find([1,2,3,4], function (error, record){ ... });
//> SELECT * FROM users WHERE `id` IN (1,2,3,4)

User.find({
	select: ["name", "password"],
	conditions: ["name LIKE ?", "%foo%"],
	limit: 1
});
//> SELECT `name`, `password` FROM users WHERE `name` LIKE '%foo%' LIMIT 1

User.find('first');
//> SELECT * FROM users LIMIT 1 ORDER BY `id` ASC

User.find('last', { name_is_not: 'foo' });
//> SELECT * FROM users WHERE `name` IS NOT 'foo' LIMIT 1 ORDER BY `id` DESC

User.find('all', { password: 'bar' });
//> SELECT * FROM users WHERE `password` = 'bar'

User.find('all', { name_like: "%foo%" }, function (error, records){
	if (error) throw error;

	records.map(function (record){
		return record.to_json();
	})
});
//> SELECT * FROM users WHERE `name` LIKE '%foo%'
```

### first([conditions], [callback])
`@alias find('first', [conditions], [callback])`
```js
User.first({ id_gt: 10 });
//> SELECT * FROM users WHERE `id` > 10
```

### last([conditions], [callback])
`@alias find('last', [conditions], [callback])`
```js
User.last({ name_like: '%foo%' });
//> SELECT * FROM users WHERE `name` LIKE '%foo%';
```

### all([conditions], [callback])
`@alias find('all', [conditions], [callback])`
```js
User.all(function (error, records){ ... });
//> SELECT * FROM users
```

### exists([conditions], [callback])
```js
User.exists(1);
//> SELECT 1 FROM users WHERE `id` = 1

User.exists({ name: 'foo' });
//> SELECT 1 FROM users WHERE `name` = 'foo'
```

### join(table_name, [conditions], [callback])
```js
User.find({
	include : {
		join: 'phones',
		direction: "LEFT",
		on: "phones.user_id != users.id"
	}
});
//> SELECT * FROM users LEFT JOIN phones ON phones.user_id != users.id

User.find({ include: 'phones' });
//> SELECT * FROM users INNER JOIN phones ON `phones`.`id` = `user`.`id`

User.join('phones');
//> SELECT * FROM users INNER JOIN phones ON `phones`.`user_id` = `user`.`id`

User.join('phones', { name: 'foo' })
//> SELECT * FROM users INNER JOIN phones ON phones.user_id = users.id WHERE `name` = 'foo'
```

### find_by_sql(sql, [values], [callback])
```js
User.find_by_sql("SELECT DISTINCT(*) FROM users "
                +"INNER JOIN foo ON `foo`.`user_id` = `users`.`id` "
                +"WHERE `users`.`name`LIKE ?", ['%bar%'], function (error, records){ ... })
```

### find_by_id(id, [callback])
```js
User.find_by_id(1)
//> SELECT * FROM users WHERE `id` = 1
```

### field(*fields)
Create dynamic finders
```js
User.fields('name', 'password', 'created_at', 'updated_at');

User.find_by_name('foo');
//> SELECT * FROM users WHERE `name` = 'foo'

User.find_by_created_at(new Date().toString());
//> SELECT * FROM users WHERE created_at = 'Thu Dec 11 2014 22:32:45 GMT-0300 (AMST)'
```

## Calculations
`@methods`: `count`, `average` alias `avg`, `minimum` alias `min`, `maximum` alias `max`, `sum`.

### count([column_name], [conditions], [callback])
```js
User.count('*');
//> SELECT COUNT(*) FROM users

User.count('*', { name_like: '%foo%' }, function (error, response){ ... });
//> SELECT COUNT(*) FROM users  WHERE `name` LIKE '%foo%'
```

### average([column_name], [conditions], [callback])
`@alias avg`
```js
User.average('id');
//> SELECT AVG(id) FROM users

User.avg('id', { name_like: '%foo%' }, function (error, response){ ... });
//> SELECT AVG(id) FROM users  WHERE `name` LIKE '%foo%'
```

### minimum([column_name], [conditions], [callback])
`@alias min`
```js
User.minimum('id');
//> SELECT MIN(id) FROM users

User.min('id', { name_like: '%foo%' }, function (error, response){ ... });
//> SELECT MIN(id) FROM users  WHERE `name` LIKE '%foo%'
```

### maximum([column_name], [conditions], [callback])
`@alias max`
```js
User.maximum('id');
//> SELECT MAX(id) FROM users

User.max('id', { name_like: '%foo%' }, function (error, response){ ... });
//> SELECT MAX(id) FROM users  WHERE `name` LIKE '%foo%'
```

### sum([column_name], [conditions], [callback]);
```js
User.sum('id');
//> SELECT SUM(id) FROM users

User.sum('id', { name_like: '%foo%' }, function (error, response){ ... });
//> SELECT SUM(id) FROM users  WHERE `name` LIKE '%foo%'
```

## Actions
`@methods`: `create`, `update`, `update_all`, `destroy`, `destroy_all`, `delete`, `delete_all`.

### create(params, [callback])
```js
User.create({
	name: 'Akrata',
	password: 'akrata',
	password_confirmation: 'akrata'
});
//> INSERT INTO users SET `name` = 'Akrata', `password` = '79a1a1b8ee1b831a27db58089cbf298dc38f3eec', `updated_at` = '2014-12-13 11:07:11', `created_at` = '2014-12-13 11:07:11'
```

### update(id, params, [callback])
```js
User.update(1, {
	name: 'Fooo',
	password: '@kr@t@',
	password_confirmation: '@kr@t@'
});
//> UPDATE users SET `name` = 'Fooo', `password` = '0f962118caa0122e7b7c9b1266cecf77918c9f65', `updated_at` = '2014-12-13 11:19:24' WHERE `id` = 1
```

### update_all(conditions, params, [callback])
```js
User.update_all({ name: 'foo' }, { name: 'bar' });
```

### destroy(id, [callback])
Find the record before destroy
```js
User.destroy(1);
//> SELECT * FROM users WHERE id = 1
// if record
//> DESTROY FROM users WHERE id = 1
```

### destroy_all([conditions], [callback])
Find all record before destroy
```js
User.destroy_all({ id_gt: 10 });
//> SELECT * FROM users WHERE id > 10
// if record > 0
//> DESTROY FROM users WHERE id = @record.id
```

### delete(id, [callback])
Like destroy() method, but don't find.
```js
User.delete(1);
//> DELETE FROM users WHERE id = 1
```

### delete_all([conditions], [callback])
Like destroy_all() method, but don't find.
```js
User.delete_all({ id_gt: 10 });
//> DESTROY FROM users WHERE id > 10
```

## Callbacks
`@methods`: `before_create`, `before_update`, `before_destroy`, `before_find`.


## Instance Methods
### Attributes Methods

`@methods`: `initialize`, `set`, `get`, `to_object`, `to_json`, `keys`, `values`, `attributes`, `is_valid`,
`changed`, `toString`, `save`, `update_attributes`, `destroy`, `errors`: { `add`, `remove`, `clear`, `set`, `get`, `any`, `size`, `full_messages` }.

### initialize(attributes)
Initialize instance variables
```js
var user = new User();
user.set('name', 'Foo'); // return ERROR
// initialize variables
user.initialize();
user.set('name', 'Foo');
```

### set(key, value)
```js
var user = new User();
user.initialize();
user.set('name', 'Foo');
user.get('name'); // return 'Foo'
console.log(user.name);

user.set('password', 'bar');
user.get('password'); // return 'bar'

//** DON'T USE **//
user.name = 'Foo';
```

###

### Validations
`@methods`: `validates`, `validates_with`, `validate_presence_of`, `validate_uniqueness_of`, `validate_numericality_of`, `validate_length_of`, `validate_format_of`, `validate_exclusion_of`, `validate_inclusion_of`, `validate_confirmation_of`, `has_secure_password`: { `authenticate` }
###
```js
function User(attr){
	this.initiliaze(attr);

	this.validates('name', {
		presence: true
	})

	this.validate_length_of('name', { minimum: 5 })
}
```



### Callbacks
`@methods`: `before_create`, `after_create` ,`before_update`, `after_update`, `before_destroy`, `after_destroy`, `before_find`, `after_find`.
### before_create(record)

### after_create(response, record)

### before_update(record, new_values, old_values);

### after_update(response, record)

### before_destroy(record)

### after_destroy(response, record)

There are two way to configure the callback.
Config in class
Example:
```js
/* Before update */
User.before_create(function (record){
	if (record.get('name') == 'root'){
		record.errors.add('name', 'Is reserved.');
	}
})

/* After create */
User.after_create(function (record){
	console.log('User #'+ record.get('name') +'created with success.');
})
```
#### Config in instance
```js
function User (attr){
	this.initialize(attr);

	this.before_create(checkName);

	function checkName (){
		if (this.name == 'root') this.errors.add('name', 'Is reserved.');
	}
}
```

## License
GPLv3
