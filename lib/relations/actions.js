var ActiveSupport       = require('../active_support')
	, ActiveRecord      = require('../active_record')
	, ActiveRecordError = require('../error')
	, Query             = require('./query');

module.exports = Action

function Action (){
	/**
	*	@param {Object} params
	*	@param {Function} callback
	*
	*	Example:
	*	create({ name: `foo`, password: `bar`}, function(data){
	*		console.log(data)
	*	})
	*	INSERT INTO foo (name,password) VALUES (`foo`, `bar`)
	*/
	this.create = function create(params, callback){
		if (Object.prototype.toString.call(params)!="[object Object]") params = {};

		var instance = new this(params);

		if (instance.constructor.get('record_timestamps')){
			instance.set('updated_at', new Date());
			instance.set('created_at', new Date());
		}

		if (instance._foreign_key_id){
			instance.set(this.foreign_key, instance._foreign_key_id);
		}

		if( params[this.primary_key] ) delete params[this.primary_key]; // DELETE `id` for rescue error ER_DUP_ENTRY;

		/*
		*	Events style for Model
		*
		*	Example:
		*	User.on('before_create', function (user){
		*		user.validates_with(function (){
		*			if (user.get('name')=='root'){
		*				user.errors.add('name', 'SuperUserr u.u')
		*			}
		*		})
		*	})
		*/
		this.emit('before_create', instance);
		/**
		*	Callbacks (BeforeCreate & AfterCreate)
		*/
		Action._create_callback_for.call(instance, 'create', undefined, params, callback);
		instance.emit('before_create', instance);
		return instance;
	}

	/**
	*	@param {Integer|String} id
	*	@param {Object} params
	*	@param {Function} callback
	*
	*	Example:
	*	update(1, { name: `bar`, password: `foo`}, function(data){
	*		console.log(data)
	*	});
	*	UPDATE foo SET name = `bar`, password = `foo` WHERE id = 1
	*/
	this.update = function update(id, params, callback){
		var RecordNotFound = new ActiveRecordError.RecordNotFound();
		if (isNaN(parseInt(id))){
			RecordNotFound.message = "Couldn\'t find '"+ (this.table_name ? this.table_name: this.constructor.table_name) +"' without an ID";
			this.constructor.emit ? this.constructor.emit('exception', RecordNotFound) : undefined;
			console.error(RecordNotFound.toString());
			return callback ? callback(RecordNotFound, null) : RecordNotFound;
		}

		id = parseInt(id);

		var primary_key = this.primary_key ? this.primary_key : this.constructor.primary_key;
		if (params && params[primary_key]) delete params[primary_key];

		var options = {
				from: this.to_s ? this.to_s() : this.constructor.to_s(),
				params: params,
				conditions: [primary_key +"= ?", id]
			}
		var query = new Query().make_update(options);
		/*
		* If the caller is a instance
		* Base.prototype.update_attributes.call(instance, [attributes], [callback]);
		*/
		if (this instanceof this.constructor){

			this.set(this.constructor.primary_key, id);
			for (p in params){
				if (this.get(p) != params[p]){
					if (!this.changes.hasOwnProperty(p)) this.changes[p] = [];
					this.changes[p].push(this.get(p), params[p]);
					this.set(p, params[p]);
				}
			}
			this.constructor.emit('before_update', this, params, this.to_object());
			Action._create_callback_for.call(this, 'update', query, params, callback);
			this.emit('before_update', this, params, this.to_object());
			return this;

		}

		var transaction = this.find(id, function _update_transaction(error, data){

			if (error){
				this.emit('exception', error);
				return callback ? callback(error, null) : error;
			}

			if(data[0]){
				for (p in params){
					if (data[0].get(p) != params[p]){
						if (!data[0].changes.hasOwnProperty(p)) data[0].changes[p] = [];
						data[0].changes[p].push(data[0].get(p), params[p]);
						data[0].set(p, params[p]);
					}
				}
				/*
				*	Emit data, new_data, old_data
				*	@param {Function} data[0]
				*	@param {Object} params
				*	@param {Object} params
				*/
				this.emit('before_update', data[0], params, data[0].to_object());
				/**
				*	Callbacks (BeforeUpdate & AfterUpdate)
				*/
				Action._create_callback_for.call(data[0], 'update', query, params, callback);
				data[0].emit('before_update', data[0], params, data[0].to_object());
				return data[0];
			}

			RecordNotFound.message = "Couldn't find '"+ this.table_name +"' with ID #"+ id;
			this.emit('exception', RecordNotFound);
			console.error(RecordNotFound.toString());
			return callback ? callback(RecordNotFound, null) : RecordNotFound;

		}.bind(this));

		return this;
	}

	/**
	*	@param {Object|Array|String} conditions
	*	@param {Object} params
	*	@param {Function} callback
	*
	*	Example:
	*	update_all(['name = `foo`'],{ name: `bar` }, function(data){
	*		console.log(data)
	*	})
	*/
	this.update_all = function update_all(conditions, params, callback){
		var self = this;
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {}
		}
		if(typeof(params)=="function"){
			callback = params;
			params = {};
		}
		return this.all(conditions, function(error, data){
			if (error){
				self.emit('exception', error);
				return callback ? callback(error, null) : error;
			}
			if(data.length > 1){
				for(var i=0; i<data.length; i++)
					data[i].update_attributes(params);
				return callback ? callback(null, data) : data;
			}
		})
	}

	/**
	*	@param {Integer|String} id
	*	@param {Function} callback
	*
	*	Example:
	*	destroy(1, function(data){
	*		console.log(data)
	*	})
	*/
	this.destroy = function destroy(id, callback){
		var RecordNotFound = new ActiveRecordError.RecordNotFound();
		if (isNaN(parseInt(id))){
			RecordNotFound.message = "Couldn't find '"+ (this.table_name ? this.table_name: this.constructor.table_name) +"' without an ID";
			this.constructor.emit ? this.constructor.emit('exception', RecordNotFound) : undefined;
			console.error(RecordNotFound.toString());
			return callback ? callback(RecordNotFound, null) : RecordNotFound;
		}

		id = parseInt(id);

		var primary_key = this.primary_key ? this.primary_key : this.constructor.primary_key;
		var options = {
			from: this.to_s ? this.to_s() : this.constructor.to_s(),
			conditions: [ primary_key +' = ?', id ]
		};

		var query = new Query().make_delete(options);

		if (this instanceof this.constructor){

			this.constructor.emit('before_destroy', this);
			/**
			*	Callbacks (BeforeDestroy & AfterDestroy)
			*/
			Action._create_callback_for.call(this, 'destroy', query, this[this.constructor.primary_key], callback);
			this.emit('before_destroy', this);
			return this;

		} else {

			return this.find(id, function(error, data){
				if (error){
					this.emit('exception', error);
					return callback ? callback(error, null) : error;
				}

				if(data[0]){
					this.emit('before_destroy', data[0]);
					/**
					*	Callbacks (BeforeDestroy & AfterDestroy)
					*/
					Action._create_callback_for.call(data[0], 'destroy', query, data[0][this.primary_key], callback);
					data[0].emit('before_destroy', data[0]);
					return ActiveSupport.freeze(data[0]);
				}

				RecordNotFound.message = "Couldn't find '"+ this.table_name +"' with ID #"+ id;
				console.error(RecordNotFound.toString());
				this.emit('exception', RecordNotFound);
				return callback ? callback(RecordNotFound, null) : RecordNotFound;

			}.bind(this))
		}
	}

	/**
	*	Similiar to `destroy`. This function fire a DELETE, and no Find before destroy.
	*
	*	@param {Integer|String} id
	*	@param {Function} callback
	*
	*	Example:
	*	delete(1, function(data){
	*		console.log(data)
	*	})
	*/
	this['delete'] = function _delete(id, callback){
		var query = new Query().make_delete({
			from: this.to_s(),
			conditions: [ this.primary_key +' = ?', id ]
		});
		/**
		*	Callbacks (BeforeDestroy & AfterDestroy)
		*	If when call this function is a Instance, send the attributes
		*	from event `before_destroy`, if not send a new Object
		*/
		var instance = new this({id: id});
		this.emit('before_destroy', instance);
		Action._create_callback_for.call(instance, 'destroy', query, id, callback);
		instance.emit('before_destroy', instance);
		return instance;
	}

	/**
	*	@param {Object|Array|String} conditions
	*	@param {Array} params
	*	@param {Function} callback
	*
	*	Example:
	*	destroy_all({ name: `foo`, password: `bar`}, function(data){
	*		console.log(data)
	*	})
	*/
	this.destroy_all = function destroy_all(conditions, callback){
		var self = this;
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {}
		}

		return this.all(conditions, function(error, data){
			if (error){
				this.emit('exception', error);
				return callback ? callback(error, null) : error;
			}

			if(data.length > 0){
				for(var i=0; i<data.length; i++){
					self.destroy.call(data[i], data[i].get(data[i].constructor.primary_key), callback);
				}
			}
		})
	}

	/*
	*	Similar to `destroy_all`, this function execute a query DELETE with conditions
	*	@param {Object|Array|String} conditions
	*	@param {Array} params
	*	@param {Function} callback
	*
	*	Example:
	*	delete_all('foo > 100')
	*	DELETE FROM <table> WHERE foo > 100
	*/
	this.delete_all = function delete_all (conditions, callback){
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {}
		}

		var query = new Query().make_delete({
			from: this.to_s(),
			conditions: conditions
		})

		return this.exec(query.sql, query.values, function _delete_all(error, data){
			if (error){
				this.emit('exception', error);
				return callback ? callback(error, null) : error;
			}
			this.cache.clear();
			return callback ? callback(null, Object.freeze(data)) : data;
		}.bind(this))
	}
}

/*
*	@param {String} action_name
*	@param {String} query
*	@param {Array} params
*	@param {Function} callback
*/
Action._create_callback_for = function _create_callback_for (action_name, query, params, callback){
	var callback_after_name = 'after_'+ action_name;
	/* Emit response to the record listen and receive a reponse */
	this.emit_response_callback(action_name);
	/* Receive the response and  `exec_query` */
	this.once('response_callback', function _response_callback (data){
		/* Check is record is valid */
		if (data.is_valid()){

			data.new_record = false;
			if (action_name == 'update'){

				if (ActiveSupport.keys(params).length==0)
					return callback ? callback.call(data, null, null, null) : null;

				if (data.constructor.get('record_timestamps')){
					params['updated_at'] = new Date();
					data.set('updated_at', params['updated_at']);
				}

				/* Check if have changes */
				if (!data.changed()) return callback ? callback(null, null) : null;

				var values = [], where_conditions = {};

				for (var key in params){
					if (data.get(key)==undefined) delete params[key];
					else params[key] = data.get(key);
				}

				where_conditions[data.constructor.primary_key] = data.get(data.constructor.primary_key);
				values.push(params, where_conditions);
				params = values;

			} else if (action_name == 'create'){

				var options = {
					from: data.constructor.to_s(),
					attr: data.keys()
				}
				query = new Query().make_insert(options);
				params = data.values();

			} else if (action_name == 'destroy'){

				if (data.constructor.cache){
					data.constructor.cache.remove_record_by(
						data.constructor.primary_key,
						data.get(data.constructor.primary_key)
					);
				}

				data.destroyed = true;
				params = query.values;
			}

			var transaction = data.constructor.exec((query.sql || query), params, function _exec_query_callback(error, response){
				if (error){
					data.constructor.emit('exception', error);
					return callback ? callback(error, null) : error;
				}
				if (response.insertId) data.set(data.constructor.primary_key, response.insertId);
				/* Fire events */
				data.constructor.emit(callback_after_name, response, data);
				data.emit(callback_after_name, response, data);
				return callback ? callback.call(data, null, response, data) : response;
			})

		}
		// if (callback) return callback.call(data, null, null, data);
	})
}
