var ActiveRecord  = require('../index');
var ActiveSupport = require('../lib/active_support');
var Base          = ActiveRecord.Base;
var log           = console.log;
// var test         = require('tap').test

var foreign_key = ActiveSupport.Inflector.foreign_key;
var pluralize   = ActiveSupport.Inflector.pluralize;
var singularize = ActiveSupport.Inflector.singularize;

var dbConfig = exports.dbConfig = {
	"driver": "sqlite3",
	"filename": ":memory:"
}


var Connection = exports.Connection = (function Connection (callback){
	if (!Base.connection.connected()) {
		// Configure Connection using a JSON file
		Base.configure_connection(dbConfig/*'../examples/database.json'*/);
		// Establish Connection
		Base.establish_connection(callback);
	}

	return Connection = Base.connection.conn;
})()


var createTable = exports.createTable = function createTable (table_name, fields){
	var driver = Base.connection.get('driver');
	var auto_increment = driver == 'sqlite3' ? 'AUTOINCREMENT' : driver == 'postgres' ? '' : 'AUTO_INCREMENT';
	var pk = driver == 'postgres' ? 'PRIMARY KEY ' : 'PRIMARY KEY '+ auto_increment;
	var str = [];
	var sql = "CREATE TABLE IF NOT EXISTS "+ table_name +" ( ";
	for (field in fields){
		var f = [];
		f.push(field);
		if (fields[field]['type']){
			if (driver == 'postgres') fields[field]['type'] = 'serial';
			f.push(fields[field]['type'].toUpperCase());
		}
		if (fields[field]['primary_key']) f.push(pk);
		if (fields[field]['null'] === false) f.push('NOT NULL');
		str.push(f.join(' '));
		if (fields[field]['belongs_to'])
			str.push('FOREIGN KEY('+ foreign_key(fields[field]['belongs_to'])
							+') REFERENCES '+ pluralize(fields[field]['belongs_to'])
							+'(id) ON UPDATE CASCADE ON DELETE CASCADE');
	}
	sql += str.join(', ') + ' )';

	var tx = Connection.query(sql, function (error, response){
		console.log("\033[1;35mSQL \033[1;37m%s\033[0m", tx.sql);
		if (error) console.error("\033[1;31mERROR: \033[0;31m%s\033[0m", error);
	})
}

var dropTable = exports.dropTable = function dropTable (table_name){
	var tx = Connection.query("DROP TABLE IF EXISTS "+ table_name, function (error, response){
		console.log("\033[1;35mSQL \033[1;37m%s\033[0m", tx.sql);
		if (error) console.error("\033[1;31mERROR: \033[0;31m%s\033[0m", error);
	});
}

var prepareDb = exports.prepareDb = function prepareDb (){
	dropTable('phones');
	dropTable('users');
	dropTable('categories');
	dropTable('tags');
	dropTable('categories_tags');

	createTable('users', {
		id: { type: 'integer', primary_key: true },
		name: { type: 'varchar(50)', null: false },
		password: { type: 'varchar(50)', null: false },
		created_at: { type: 'timestamp', null: false },
		updated_at: { type: 'timestamp', null: false },
	});

	createTable('phones', {
		id: { type: 'integer', primary_key: true },
		number: { type: 'varchar(11)', null: false },
		user_id: { type: 'integer', null: false, belongs_to: 'user' },
		created_at: { type: 'timestamp', null: false },
		updated_at: { type: 'timestamp', null: false },
	})

	createTable('tags', {
		id: { type: 'integer', primary_key: true },
		name: { type: 'varchar(50)', null: false },
		created_at: { type: 'timestamp', null: false },
		updated_at: { type: 'timestamp', null: false },
	})

	createTable('categories', {
		id: { type: 'integer', primary_key: true },
		name: { type: 'varchar(50)', null: false },
		created_at: { type: 'timestamp', null: false },
		updated_at: { type: 'timestamp', null: false },
	})

	createTable('categories_tags', {
		id: { type: 'integer', primary_key: true },
		categorie_id: {type: 'integer', null: false, belongs_to: 'categorie' },
		tag_id: {type: 'integer', null: false, belongs_to: 'tag' },
	})
}

var User = function User (attributes){ this.initialize(attributes); }
Base.extend(User, Base);

var Phone = function Phone (attributes){ this.initialize(attributes); }
Base.extend(Phone, Base);

var Tag = function Tag (attributes){ this.initialize(attributes); }
Base.extend(Tag, Base);

var Categorie = function Categorie (attributes){ this.initialize(attributes); }
Base.extend(Categorie, Base);

var CategoriesTags = function CategoriesTags (attributes){ this.initialize(attributes); }
Base.extend(CategoriesTags, Base);

exports.Models = {
	User: User,
	Phone: Phone,
	Tag: Tag,
	Categorie: Categorie,
	CategoriesTags: CategoriesTags
}
