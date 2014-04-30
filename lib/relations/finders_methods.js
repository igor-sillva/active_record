var Transaction = require('../transaction')
	,	Error = require('../error')
	,	Query = require('./query')
	,	flatten = require('underscore').flatten
	, 	toArray = require('underscore').toArray

module.exports = Finder

function Finder (){
	var self = this;
	/**	
	*	@param {Array|Integer|String} id
	*	@param {Object} options //`See Query().make_select documentation`
	*	@param {Function}	callback
	*	
	*	Examples:
	*	find(1, [callback])
	*	find([1,2,3], [callback])
	*	find('all', [conditions], [values], [callback])
	*	find('first', [conditions], [values], [callback])
	*	find('last', [conditions], [values], [callback])
	* 	find({
	*		select: ['name', 'password'],
	*		conditions: {
	*			where: 'id',
	*			in: [1,2,3,4,5,6]
	*		},
	*		order: 'foo',
	*		limit: 10,
	*		offset: 5
	*	}, 
	*	[values],
	*	function(data){
	*		console.log(data)
	*	})
	*	SELECT name, password FROM foo WHERE id IN (1,2,3,4,5,6) ORDER BY foo LIMIT 10 OFFSET 5
	*/
	this.find = function find(id, options, values, callback){
		var _options = {},
			query = '';

		if(typeof(options)=="function"){
			callback = options;
			options = undefined;
		}
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}

		if(typeof(id)=="string"){
			switch(id){
				case 'first':
					_options.order = 'id ASC'
					_options.limit = 1;
					break;
				case 'last':
					_options.order = 'id DESC';
					_options.limit = 1;
					break;
				case 'all':
					_options.select = '*';
					break;
				default: 
					id = isNaN(parseInt(id)) ? NaN : parseInt(id);				
			}
			_options.conditions = options && options.conditions ? options.conditions : options;

		} else if (typeof(id)=="object" && !Array.isArray(id)) {
			_options = id;
		} else if (Array.isArray(id)) {
			_options.conditions = { 
				where: 'id', 
				in: flatten(toArray(id)) 
			}
		} else {
			_options.conditions = 'id = ?';
		}	 
		
		_options.from = this.toString();
		_options.primary_key = this.get('primary_key');
		_options.foreign_key = this.get('foreign_key');

		if (!id) throw new Error.RecordNotFound(this).toString();
		
		values = values ? values : 
				typeof(id)=="number" ? id : 
				typeof(options && options.conditions || options)=="object" ?
		        Object.values(options && options.conditions || options) : options && options.conditions || options;
		
		query = new Query().make_select(_options);
		var transaction = new Transaction().exec_query( query, values, callback );
		return this;
	}

	/**
	*	Return the first row
	*	@param {Object} options
	*	@param {Function} callback
	*
	*	Example:
	*	first(function(data){
	*		console.log(data)
	*	})
	*
	*	first({ conditions: [['id > 100'],['name <> `bar`']] }, function(data){
	*		console.log(data)
	*	})
	* 	SELECT * FROM <table> [WHERE <options>] ORDER BY id ASC LIMIT 1
	*/
	this.first = function first(options, values, callback){
		return this.find('first', options, values, callback );
	}

	/**
	*	Return the last row
	*	@param {Object|Array|String} options
	*	@param {Function} callback
	*
	*	Example:
	*	last({conditions : 'foo <> `bar`'}, function(data){
	*		console.log(data)
	*	})
	*	SELECT * FROM foo [WHERE <options>] ORDER BY bar DESC LIMIT 1
	*/
	this.last = function last(options, values, callback){
		return this.find('last', options, values, callback );
	}

	/**
	*	Return all rows in the table
	* 	@param {Object|Array|String} options
	*	@param {Function} callback
	*
	*	Example:
	*	all({conditions: "id > 10"},function(data){
	*		for(var i in data){
	*			console.log(data[i])
	*		}
	*	})
	*	SELECT * FROM foo WHERE id > 10
	*/
	this.all = function all(options, values, callback){
		return this.find('all', options, values, callback );
	}

	/**
	*	Return true if rows exists and false if not exists
	*	@param {Object|Integer|String} id_or_object
	*	@param {Function} callback
	*
	*	Example:
	*	exists(1, function(data){
	*		console.log(data)
	*	})
	*	SELECT 1 FROM foo WHERE bar = 'fuu'
	*
	*	exists({ bar: 'foo', baz: 'hardbazz' }, function(data){
	* 		console.log(data)
	* 	})
	*	SELECT 1 FROM foo WHERE bar = 'foo' AND baz = 'hardbazz'
	*/
	this.exists = function exists(id_or_object, callback){
		var object = id_or_object, options = {}, query = '', values = [];
		if( !object ) throw new Error.RecordNotFound(this).toString();
		options = {
			from: this.toString(),
			select: 1,
			limit: 1,
			conditions: typeof(object)=="object" ? Object.keys(object).map(function(o){ return o +' = ?'}) : 'id = ?'
		}
		values = typeof(object)=="object" ? Object.values(object.conditions || object) : object
		query = new Query().make_select(options);
		var transaction = new Transaction().exec_query( query, values, function(data){
			var resp = data && data['1'] ? true : false;
			return callback ? callback(resp) : resp;
		})
		return this;
	}

	/**
	*	@param {Object|Array|String} params
	*	@param {Array} values
	*	@param {Function} callback
	*
	*	Example:
	*	where([['id > 100'], ['foo = `bar`']], function(data){
	*		console.log(data)
	* 	})
	*	SELECT * FROM foo WHERE id > `100` AND foo = `bar`
	*/
	this.where = function where(params, values, callback){
		if (1 == arguments.length && typeof(params)=="string"){
			return this._where(params);
		}
		if(!params) throw new Error.RecordNotFound(this).toString();
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		options = {
			from: this.toString(),
			select: '*',
			conditions: params
		};
		var query = new Query().make_select(options);
		var transaction = new Transaction().exec_query( query, values, callback );
		return this;
	},

	/**
	*	@param {String} sql
	*	@param {Array} params
	*	@param {Function} callback
	*
	*	Example:
	*	find_by_sql("SELECT * FROM foo WHERE name = ?", ['bar'], function(data){
	*		console.log(data)
	*	})
	*/
	this.find_by_sql = function find_by_sql(sql, params, callback){
		var transaction = new Transaction().exec_query(sql, params, callback);
		return this;
	}

	/**
	*	@param {String} table_name
	*	@param {Object|Array|String} options
	*	@param {Function} callback
	*
	*	Example:
	*	join('phones', { conditions: ["id = 1"]}, function(data){
	*		console.log(data)
	*	})
	*/
	this.join = function join(table_name, options, callback){
		if (1 == arguments.length && typeof(params)=="string"){
			return this._join(params);
		}
		var options = options || {},
			query = '';	
		if(typeof(options)=="function"){
			callback = options;
			options = {};
		}
		options = {
			from: this.toString(),
			join: table_name
		}
		query = new Query().make_select(options);
		var transaction = new Transaction().exec_query(query, callback);
		return this;
	}

	/**
	*	@param {Object|Array|String} options
	*	Create methods for write the SQL in concat :P (Fuck this english)
	*
	*	Example:
	*	Model
	*	.select(['bar', 'foo'])
	*	.where('bar LIKE ?')
	*	.and('foo = ?')
	*	.or('bar != ?')
	*	.order('foo DESC')
	*	.limit(10)
	*	.offset(10)
	*	.group("bar")
	*	.execute(["foo", "bar", "baz"], function (data){
	*		console.log(data)
	*	})
	*/
	var queryOptions = {};
	["select", "or", "and", "order", "where", 
	"join", "order", "group", "limit", "offset",
	"in", "notIn", "notNull", "any", "some", 
	"like", "exists", "notExists"].forEach(function (method){
		/**
		*	@param {Object} options
		*/
		self[method] = function (options){
			queryOptions[method] = options || {};
			return self;
		}
	})

	/**
	*	@param {String} _query (Optional)
	*	@param {Array} values
	*	@param {Function} callback
	*/
	this.execute = function execute (query, values, callback){
		var q = "";
		if (Array.isArray(query)){
			values = query;
			query = null;
		}
		if (typeof(query)=="function"){
			callback = query;
			query = null;
		}
		if (typeof(values)=="function"){
			callback = values;
			values = [];
		}
		if (!query){

			queryOptions.from = this.get('table_name');
			queryOptions.primary_key = this.get('primary_key');
			queryOptions.foreign_key = this.get('foreign_key');
			queryOptions.conditions = {};

			['where', 'in', 'notIn', 'notNull', 'any', 'some', 'like', 'exists', 'notExists'].forEach(function (method){
				if (queryOptions.hasOwnProperty(method)){
					queryOptions.conditions[method] = queryOptions[method];
				}
			})
			query = new Query().make_select(queryOptions);
		}
		q = query;
		return new Transaction().exec_query(q, values, callback);
	}

}

// Helper
Object.values = function(object){
	var values = []
	for(var i in object)
		values.push(object[i])
	return values
}