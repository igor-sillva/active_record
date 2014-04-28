var Transaction = require('../transaction')
	, Query = require('./query');

module.exports = Action

function Action (){	
	var self = this;

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
		if( params.id ) delete params.id;
		options = {
			from: this.toString(),
			params: params
		}
		params_ = Object.values(params);
		query = new Query().make_insert(options);
		
		/**
		*	Callbacks (BeforeCreate & AfterCreate)
		*/
		this.emit('before_create', params)
		return _callback_for('create', query, params_, callback);
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
				self.emit('before_update', {update: params, row: data[0]});
				return _callback_for('update', query, data[0].id, callback);
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
	*		conso\le.log(data)
	*	})
	*/
	this.update_all = function update_all(conditions, params, callback){
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
				self.emit('before_destroy', data[0]);
				return _callback_for('destroy', query, data[0]['id'], callback);
			}
		})
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
					return self.destroy( data[i].id, callback );
			}
		})
	}

	function _callback_for(name, query, params, callback){
		var after = 'after_'+ name;
		if (self.response_callback() === true){
			return new Transaction().exec_query(query, params, function (data){
				self.emit(after, params);
				return callback ? callback(data) : data;
			})
		} else if (self.response_callback() === false){
			return false;
		}
	}

}

// Helper
Object.values = function(object){
	var values = []
	for(var i in object){
		console.log(typeof object[i])
		if (typeof object[i] === 'function' || typeof object[i] === Function)
			values.push(object[i])
	}
	return values
}