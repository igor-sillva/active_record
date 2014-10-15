var Exception = require('../error')
	,	Query = require('./query');

module.exports = Finder

function Finder (){
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
		} else if (typeof(id)=="object" && !Array.isArray(id)) {
			_options = id;
		} else if (Array.isArray(id)) {
			_options.conditions = {
				where: 'id',
				in: [id]
			}
		} else {
			_options.conditions = 'id = ?';
		}

		_options.from = this.toString();
		_options.primary_key = this.primary_key;
		_options.foreign_key = this.foreign_key;

		for (var i in options){
			_options[i] = options[i];
		}
		_options.conditions = options && options.conditions ? options.conditions : undefined;

		if (!id) throw new Exception.RecordNotFound(this).toString();

		values = values ? values :
				typeof(id)=="number" ? id :
				typeof(options && options.conditions || options)=="object" ?
		        Object.values(options && options.conditions || options) : options && options.conditions || options;

		query = new Query().make_select(_options);

		return this.exec_query( query, values, function (data){
			if (data.length > 0){
				for (d in data){
					data[d] = new this(data[d]);
				}
			}
			return callback ? callback(data) : data;
		}.bind(this));
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
		if (1 == arguments.length && typeof(params)=="string"){
			return this._exists(params);
		}
		var object = id_or_object, options = {}, query = '', values = [];
		if( !object ) throw new Exception.RecordNotFound(this).toString();
		options = {
			from: this.toString(),
			select: 1,
			limit: 1,
			conditions: typeof(object)=="object" ? Object.keys(object).map(function(o){ return o +' = ?'}) : 'id = ?'
		}
		values = typeof(object)=="object" ? Object.values(object.conditions || object) : object
		query = new Query().make_select(options);
		return this.exec_query( query, values, function(data){
			var resp = data[0] && data[0]['1']==1 ? true : false;
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
	* 	})
	*	SELECT * FROM foo WHERE id > `100` AND foo = `bar`
	*/
	this.where = function where(params, values, callback){
		if (1 == arguments.length && typeof(params)=="string"){
			return this._where(params);
		}
		if(!params) throw new Exception.RecordNotFound(this).toString();
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
		return this.exec_query( query, values, function (data){
			if (data.length > 0){
				for (d in data){
					data[d] = new this(data[d]);
				}
			}
			return callback ? callback(data) : data;
		}.bind(this));
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
		return this.exec_query(sql, params, function (data){
			if (data.length > 0){
				for (d in data){
					data[d] = new this(data[d]);
				}
			}
			return callback ? callback(data) : data;
		}.bind(this));
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
		return this.exec_query(query, function (data){
			if (data.length > 0){
				for (d in data){
					data[d] = new this(data[d]);
				}
			}
			return callback ? callback(data) : data;
		}.bind(this));
	}

	/**
	*	=*=*=*= DEPRECATED =*=*=*=
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
	// var queryOptions = {};
	// ["select", "or", "and", "order", "_where", "is",
	// "join", "order", "group", "limit", "offset",
	// "in", "notIn", "notNull", "any", "some",
	// "like", "_exists", "notExists"].forEach(function (method){
	// 	/**
	// 	*	@param {Object} options
	// 	*/
	// 	this[method] = function (options){
	// 		queryOptions[method] = options || {};
	// 		return this;
	// 	}
	// })

	// /**
	// *	@param {String} query (Optional)
	// *	@param {Array} values
	// *	@param {Function} callback
	// */
	// this.execute = function execute (query, values, callback){
	// 	if (Array.isArray(query)){
	// 		values = query;
	// 		query = null;
	// 	}
	// 	if (typeof(query)=="function"){
	// 		callback = query;
	// 		query = null;
	// 	}
	// 	if (typeof(values)=="function"){
	// 		callback = values;
	// 		values = [];
	// 	}
	// 	if (!query){

	// 		queryOptions.from = this.table_name;
	// 		queryOptions.primary_key = this.primary_key;
	// 		queryOptions.foreign_key = this.foreign_key;
	// 		queryOptions.conditions = {};

	// 		['_where', 'in', 'notIn', 'notNull', 'any', 'some', 'like', '_exists', 'notExists', 'is'].forEach(function (method){
	// 			if (queryOptions.hasOwnProperty(method)){
	// 				queryOptions.conditions[method] = queryOptions[method];
	// 			}
	// 		})
	// 		query = new Query().make_select(queryOptions);
	// 	}

	// 	return this.exec_query(query, values, function (data){
	// 		if (data.length > 0){
	// 			for (d in data){
	// 				data[d] = new this(data[d]);
	// 			}
	// 		}
	// 		return callback ? callback(data) : data;
	// 	});
	// }

}

// Helper
Object.values = function(object){
	var values = [];
	delete object['_events']
	for(var i in object)
		if(typeof(object[i])!="function"&&!object[i].messages&&!object[i].valid)
			values.push(object[i]);
	return values
}
