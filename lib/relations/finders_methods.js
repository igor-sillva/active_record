var Transaction = require('../transaction')
	,	Error = require('../error')
	,	Query = require('./query')
	,	flatten = require('underscore').flatten
	, toArray = require('underscore').toArray

module.exports = Finder

function Finder (){
	/**	
	*	@param {Array|Integer|String} id
	*	@param {Object} options `See Query.make_select documentation`
	*	@param {Function}	callback
	*	
	*	Examples:
	*	find(1, [callback])
	*	find([1,2,3], [callback])
	*	find('all', [callback])
	*	find('first', [conditions], [callback])
	*	find('last', [conditions], [callback])
	* find({
	*		select: ['name', 'password'],
	*		conditions: {
	*			where: 'id',
	*			in: [1,2,3,4,5,6]
	*		},
	*		order: 'foo',
	*		limit: 10,
	*		offset: 5
	*	}, function(data){
	*		console.log(data)
	*	})
	*	SELECT name, password FROM foo WHERE id IN (1,2,3,4,5,6) ORDER BY foo LIMIT 10 OFFSET 5
	*/
	this.find = function (id, options, callback){
		var id = id, 
			options = options || {},
			query = '', values = [];
		if(typeof(options)=="function"){
			callback = options;
			options = {};
		}
		options.from = this.toString()
		if(typeof(id)=="string"){
			switch(id){
				case 'first':
					options.order = 'id ASC'
					options.limit = 1;
					break;
				case 'last':
					options.order = 'id DESC';
					options.limit = 1;
					break;
				case 'all':
					options.select = '*';
					break;
				default: 
					id = isNaN(parseInt(id)) ? NaN : parseInt(id);				
			}
		} else {
			id = typeof(id)=="object" ? flatten(toArray(id)) : id
			options.conditions = Array.isArray(id) ? { where: 'id', in: id } : 'id = ?'
		}	 
		
		if(!id) throw new Error.RecordNotFound(this).toString();

		values = typeof(id)=="number" ? id : typeof(options.conditions || options)=="object" ?
		         Object.values(options.conditions || options) : options.conditions || options;

		query = new Query().make_select(options);
		return new Transaction().exec_query( query, values, callback );
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
	this.first = function (options, callback){
		return this.find('first', options, callback );
	}

	/**
	*	Return the last row
	*	@param {Object|Array|String} options
	*	@param {Function} callback
	*
	*	Example:
	*	last('foo <> `bar`', function(data){
	*		console.log(data)
	*	})
	*	SELECT * FROM foo [WHERE <options>] ORDER BY bar DESC LIMIT 1
	*/
	this.last = function (options, callback){
		return this.find('last', options, callback );
	}

	/**
	*	Return all rows in the table
	* @param {Object|Array|String} options
	*	@param {Function} callback
	*
	*	Example:
	*	all(function(data){
	*		for(var i in data){
	*			console.log(data[i])
	*		}
	*	})
	*	SELECT * FROM foo
	*/
	this.all = function (callback){
		return this.find('all', callback );
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
	* 	console.log(data)
	* })
	*	SELECT 1 FROM foo WHERE bar = 'foo' AND baz = 'hardbazz'
	*/
	this.exists = function (id_or_object, callback){
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
		return new Transaction().exec_query( query, values, function(data){
			var resp = data && data['1'] ? true : false;
			return callback ? callback(resp) : resp;
		})
	}

	/**
	*	@param {Object|Array|String} params
	*	@param {Array} values
	*	@param {Function} callback
	*
	*	Example:
	*	where([['id > 100'], ['foo = `bar`']], function(data){
	*		console.log(data)
	* })
	*/
	this.where = function (params, values, callback){
		if(!params)
			throw new Error.RecordNotFound(this).toString();
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
		return new Transaction().exec_query( query, values, callback );
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
	this.find_by_sql = function (sql, params, callback){
		return new Transaction().exec_query(sql, params, callback);
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
	this.join = function (table_name, options, callback){
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
		return new Transaction().exec_query(query, callback);
	}

	/*
	*	Create custom methods
	*	
	*	@param {String} method_name
	*	@param {Object} conditions
	*
	* Example: Model._create_custom_finders_methods({method_name: 'name', column_name: 'name'})
	* Return: Model.find_by_<method_name>(`bar`, <callback>);
	*/
	this._create_custom_finders_methods = function(options) {
		var Model = this;
		var method_name = options['method_name']
			,	column_name = options['column_name']
			, conditions  = options['conditions']

		conditions['where'] = column_name.concat(conditions);
		/*	Create the finders methods personalized
		*	@param {String|Array} value
		*	@param {Function} callback
		*/		
		this['find_by_'+ method_name] = function ( value, callback ){
			return Model.where(conditions, value, callback);						
		}
	}
	// Alias
	this._custom_methods = this._create_custom_finders_methods;
}

// Helper
Object.values = function(object){
	var values = []
	for(var i in object)
		values.push(object[i])
	return values
}