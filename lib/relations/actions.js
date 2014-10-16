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
		var options = {}, query = '',params = params || {};
		var instance = params instanceof this ? params : new this(params);
		if (this._has_many_association){
			params[this.foreign_key] = instance[this.foreign_key];
		}
		// if( params.id ) delete params.id;
		options = {
			from: this.toString(),
			params: params
		}
		var params_ = Object.values(params);
		query = new Query().make_insert(options);
		/**
		*	Callbacks (BeforeCreate & AfterCreate)
		*/
		_create_callback_for.bind(this)('create', query, params_, callback, instance);
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
		var self = this;
		var options = {
				from: this.toString()
			}
			, id = Array.isArray(id) ? id[0] : id;

		return this.find(id, function(data){
			if( data[0] ){
				options.params = params;
				options.conditions = { id: "?"};
				query = new Query().make_update(options);

				/**
				*	Callbacks (BeforeUpdate & AfterUpdate)
				*/
				_create_callback_for.bind(this)('update', query, data[0][self.primary_key], callback, data[0]);
				data[0].emit('before_update', data[0]);
				return data[0];
			}
		})
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
		*	Need `find()` all times when you destroy,
		*	because need send the data in event `self.emit()` :(
		*/
		return this.find(id, function(data){
			if(data[0]){
				query = new Query().make_delete(options);

				/**
				*	Callbacks (BeforeDestroy & AfterDestroy)
				*/
				_create_callback_for.bind(this)('destroy', query, data[0]['id'], callback);
				data[0].emit('before_destroy', data[0]);
				return data[0];
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
		var self = this;
		console.log(this)
		var query = new Query().make_delete({
			from: this.toString(),
			conditions: 'id = ?'
		});
		/**
		*	Callbacks (BeforeDestroy & AfterDestroy)
		*	If when call this function is a Instance, send the attributes
		*	from event `before_destroy`, if not send a new Object
		*/
		var instance = new self({id: id});
		_create_callback_for.bind(this)('destroy', query, id, callback, instance);
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

		return self.exec_query(query, params, function (data){
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
		var after = 'after_'+ callback_name, self = this;
		instance.emit_response_callback();
		instance.on('response_callback', function _response_callback (data){
			params = data && data instanceof self ? Object.values(data) : params;
			if (!data.errors.any && data.valid){
				return self.exec_query(query, params, function _callback_create_callback_for(data){
					if (data.affectedRows > 0 || data.changedRows > 0)
						instance.emit(after, callback_name == 'create' ? data : instance);
					return callback ? callback(data) : data;
				})
			}
			return false;
		})
		return instance;
	}
}
