var ActiveSupport = require('../active_support')
	, Exception = require('../error')
	, Query = require('./query');

module.exports = Finder

function Finder (){
	/**
	*	@param {Array|Integer|String} id
	*	@param {Object} options //`See Query().make_select documentation`
	*	@param {Array} values
	*	@param {Function} callback
	*
	*	@options
	*	@param
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
	this.find = function find(id, conditions, callback){
		var options = options || {}, conditions = conditions || {};
		/* If find({select: '*', ...}); */
		if (Object.prototype.toString.call(id)=="[object Object]") options = id;
		/* If find(1, {Function}) */
		if (typeof(conditions)=="function") {
			callback = conditions;
			conditions = {};
		}
		/* If find('first') */
		if (typeof(id) == "string"){

			switch (id){
				case 'first': /* Finder.first */
					options.order = this.primary_key +' ASC';
					options.limit = 1;
					break;
				case 'last': /* Finder.last */
					options.order = this.primary_key +' DESC';
					options.limit = 1;
					break;
				case 'all': /* Finder.all */
					options.select = options.select || "*";
					break;
				default:
					id = isNaN(parseInt(id)) ? NaN : parseInt(id);
			}

		}
		if (id instanceof Array){
			conditions[this.primary_key] = id;
		}

		options.from = this.to_s();
		options.primary_key = this.primary_key;
		options.foreign_key = this.foreign_key;

		if (typeof(id) == 'number') options.conditions = [this.primary_key +" = ?", id];
		else options.conditions = conditions.conditions || conditions.where || conditions;

		for (opt in conditions) options[opt] =  conditions[opt];

		/* If id == undefined or NaN or null*/
		if (!id) {
			var RecordNotFound = new Exception.RecordNotFound("Couldn't find '"+ this.table_name +"' without an ID");
			console.error(RecordNotFound.toString());
			this.emit('exception', RecordNotFound);
			return callback ? callback(RecordNotFound, null) : RecordNotFound;
		}

		if (this._extra_parameters) options.extras = this._extra_parameters;
		var query = new Query().make_select(options);

		return this.find_by_sql(query.sql, query.values, callback);
	}

	/**
	*	DYNAMIC FIND
	*	@param {Number} id
	*	@param {Function} callback
	*
	*	Example:
	*	find_by_id(1, [callback]);
	*/
	this.find_by_id = function find_by_id (id, callback){
		return this.all({ conditions: [this.primary_key +" = ?", id] }, callback);
	}

	/*
	*	Create dynamic finds
	*	@param {Array} fields
	*
	*	Example:
	*	fields(['name', 'password'])
	*	@return Model.find_by_name AND Model.find_by_password
	*/
	this.fields = function fields (){
		for (var f=0; f<arguments.length, field=arguments[f]; f++){
			if (field==this.primary_key) delete field;
			this.get('fields').push(field);
			(function (field){
				this['find_by_'+ field] =  function find_by_field(value, callback){
					return this.all([ field +" = ?", value ], callback);
				}
			}.call(this, field));
		}
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
	this.first = function first(options, callback){
		return this.find('first', options, callback );
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
	this.last = function last(options, callback){
		return this.find('last', options, callback);
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
	this.all = function all(options, callback){
		return this.find('all', options, callback );
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
		var object = id_or_object || {}, options = {};

		if(object instanceof Number && isNaN(parseInt(object))){
			var RecordNotFound = new Exception.RecordNotFound("Couldn\'t find '"+ this.table_name +"' without an ID");
			console.error(RecordNotFound.toString());
			this.emit('exception', RecordNotFound);
			return callback ? callback(RecordNotFound, null) : RecordNotFound;
		}

		options = {
			from: this.to_s(),
			select: 1,
			limit: 1,
			conditions: typeof(object)=="object" ? object : [ this.primary_key +' = ?', object ]
		};

		if (this._extra_parameters) options.extras = this._extra_parameters;
		var query = new Query().make_select(options);

		return this.find_by_sql(query.sql, query.values, function _exists_transaction(error, data){
			var resp = data[0] && data[0]['1']==1 ? true : false;
			this.emit('after_find', data);
			return callback ? callback.call(data, error, resp) : resp;
		}.bind(this));
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
	this.where = function where(conditions, callback){
		var options = {};
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		for (opt in conditions) options[opt] =  conditions[opt];
		options.from = this.to_s();
		options.select = '*';
		options.conditions = conditions.conditions || conditions.where || conditions;
		if (this._extra_parameters) options.extras = this._extra_parameters;
		var query = new Query().make_select(options);
		return this.find_by_sql(query.sql, query.values, callback);
	},

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
		var options = options || {};
		if(typeof(options)=="function"){
			callback = options;
			options = {};
		}

		options = {
			from: this.to_s(),
			join: table_name,
			primary_key: this.primary_key,
			foreign_key: this.foreign_key,
			conditions: options
		}

		if (this._extra_parameters) options.extras = this._extra_parameters;
		var query = new Query().make_select(options);
		return this.find_by_sql(query.sql, query.values, callback);
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
	this.find_by_sql = function find_by_sql(sql, values, callback){
		this.emit('before_find', {sql: sql, values: values});
		var transaction = this.exec(sql, values, function _find_by_sql_transaction(error, data){
			data = ActiveSupport.extend([], data);
			if (data){
				for (d in data){
					data[d] = new this(data[d]);
					data[d].new_record = false;
					this.emit('record', data[d]);
				}
			}
			this.emit('after_find', data);
			return callback ? callback.call(data, error, data) : data;
		}.bind(this));

		return this;
	}
}
