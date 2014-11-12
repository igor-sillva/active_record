var Query = require('./query');

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
		var options = {}, query = '', params = params || {}, instance = null;
		instance = new this(params);
		if (this._has_many_association){
			params[this.foreign_key] = instance[this.foreign_key];
			instance.set(this.foreign_key, instance._belongs_to.get(this.primary_key))
		}

		// if( params.id ) delete params.id; // DELETE `id` for rescue error ER_DUP_ENTRY;

		options.params = params;
		options.from = instance.constructor.toString();
		query = new Query().make_insert(options);
		/**
		*	Callbacks (BeforeCreate & AfterCreate)
		*/
		_create_callback_for('create', query, instance.to_object(), callback, instance);
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
	*	})
	*	UPDATE foo SET name = `bar`, password = `foo` WHERE id = 1
	*/
	this.update = function update(id, params, callback){
		var options = {
				from: this.toString(),
				params: params,
				conditions: { id: "?" }
			}
			, id = Array.isArray(id) ? id[0] : id;

		return this.find(id, function(data){
			if(data[0]){
				/*	This is necessary, why?
					Why, imagine if data [0] has invalid data in your DB?
					This means that if you set a validation, the old data would be invalid
					and then not let you upgrade to a new one.
					For example:
					function User (){
						this.validates_length_of ('name', {minimum: 5});
					}
					User.find(function(user){
						// [Object User] -> {name: 'foo', password: 'bar'}
						// User.errors.full_messages -> ['Name is to short, minimum 5']
						user[0].update_attributes // return false; why have an error.
					}
					Have to find a way to not only pass validation with the new data with the old. [Translation by Google]
				*/
				for (p in params){
					data[0].set(p, params[p]);
				}
				query = new Query().make_update(options);

				/**
				*	Callbacks (BeforeUpdate & AfterUpdate)
				*/
				var instance =  new this(data[0])
				_create_callback_for('update', query, params, callback, instance);
				instance.emit('before_update', instance);
				return instance;
			}
		}.bind(this))
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
			params = [];
		}
		return this.all(conditions, params, function(data){
			if( data[0] ){
				for(var i=0; i<data.length; i++)
					self.update( data[0][i].id, params );
				return callback ?  callback(data[0]) : data[0];
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
	*
	*	destroy('first', function(data){
	*		console.log(data)
	*	})
	*/
	this.destroy = function destroy(id, callback){
		var self = this;
		var options = {
			from: this.toString(),
			conditions: 'id = ?'
		};

		/**
		*	Need `find()` all times when you destroy :(
		*/
		return this.find(id, function(data){
			if(data[0]){
				query = new Query().make_delete(options);

				/**
				*	Callbacks (BeforeDestroy & AfterDestroy)
				*/
				var instance = new self(data[0]);
				_create_callback_for.bind(self)('destroy', query, data[0]['id'], callback, instance);
				instance.emit('before_destroy', instance);
				return instance;
			}
		})
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
	*
	*	delete('first', function(data){
	*		console.log(data)
	*	})
	*/
	this['delete'] = function _delete(id, callback){
		var query = new Query().make_delete({
			from: this.toString(),
			conditions: 'id = ?'
		});
		/**
		*	Callbacks (BeforeDestroy & AfterDestroy)
		*	If when call this function is a Instance, send the attributes
		*	from event `before_destroy`, if not send a new Object
		*/
		var instance = new this({id: id});
		_create_callback_for('destroy', query, id, callback, instance);
		instance.emit('before_destroy', {id: id});
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
	this.destroy_all = function destroy_all(conditions, params, callback){
		var self = this;
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {}
		}
		if(typeof(params)=="function"){
			callback = params;
			params = [];
		}
		return this.all(conditions, params, function(data){
			if( data ){
				for(var i=0; i<data.length; i++)
					self.destroy( data[i].id, callback );
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
	this.delete_all = function delete_all (condition, params, callback){
		var self = this;
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {}
		}
		if(typeof(params)=="function"){
			callback = params;
			params = [];
		}

		var query = new Query().make_delete({
			from: this.toString(),
			conditions: condition
		})

		var instance = new this();
		return self.exec_query(query, params, function _delete_all(data){
			instance.emit('after_destroy', data);
			return callback ? callback(data) : data;
		})
	}

	/*
	*	@param {String} callback_name
	*	@param {String} query
	*	@param {Array} params
	*	@param {Object} instance
	*	@param {Function} callback
	*/
	var _create_callback_for = function _create_callback_for (callback_name, query, params, callback, instance){
		var callback_after_name = 'after_'.concat(callback_name);

		instance.emit_response_callback();

		instance.on('response_callback', function _response_callback (data){
			if (callback_name=="update"){
				var values = [];
				for (p in params){
					values.push(data.get(p));
				}
				values.push(data.get('id'));
				params = values;
			} else if (callback_name=="destroy"){
				data = instance;
			} else {
				params = data.to_object();
			}

			if (!data.errors.any && data.valid){

				return data.constructor.exec_query(query, params, function _callback_create_callback_for(_data){
					if (_data.affectedRows > 0 || _data.changedRows > 0){
						_data.object = data.to_object();
						data.emit(callback_after_name, callback_name != 'update' ? _data : data);
					}
					/*
					*	data.row = instance.to_object();
					*
					*	Example:
					*	function User (){
					*		this.on('after_destroy', function (data){
					*			console.log('User #%s destroyed', data.row.id)
					*		})
					*	}
					*	User.delete(1) // log 'User #1 destroyed';
					*/
					return callback ? callback(_data) : _data;
				})

			}

			return false;
		})
	}
}
