var Transaction = require('../transaction')
	,	Query = require('./query');

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
	this.create = function (params, callback){
		var options = {}, query = '',params = params || {}, self = this;
		if( params.id ) delete params.id;
		options = {
			from: this.toString(),
			params: params
		}
		params_ = Object.values(params);
		query = new Query().make_insert(options);
		// this.emit('before_create', params);
		// this.on('before_create_callback', function (response){
		// 	// console.log(this)
		// 	// if (response === true){
		// 	// 	tx.exec_query(query, params_, callback);
		// 	// } else {

		// 	// }
		// })
		return new Transaction().exec_query(query, params_, callback);
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
	this.update = function (id, params, callback){
		var options = { from: this.toString() }, id = Array.isArray(id) ? id[0] : id,
		self = this;
		this.first({ conditions: ['id = '+ id] }, function(data){
			if( data ){
				options.params = params
				options.conditions = { id: '?'}
				query = new Query().make_update(options)
				return new Transaction().exec_query(query, data['id'], callback)
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
	this.update_all = function ( conditions, params, callback){
		var self = this; conditions = conditions || {};
		this.all( conditions, function(data){
			if( data ){
				for(var i=0; i<data.length; i++)
					self.update( data['id'], params, callback );
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
	*	destroy('all', function(data){
	*		console.log(data)
	*	})
	*/
	this.destroy = function (id, callback){
		var options = { from: this.toString(), conditions: 'id = ?' }, self = this;
		this.find( id, function(data){
			if( data ){
				query = new Query().make_delete(options)
				new Transaction().exec_query(query, data['id'], callback)
			}
		})
	}

	/**
	*	@param {Object} params
	*	@param {Function} callback
	*
	*	Example:
	*	create({ name: `foo`, password: `bar`}, function(data){
	*		console.log(data)
	*	})
	*/
	this.destroy_all = function (conditions, params, callback){
		var self = this; conditions = conditions || {};
		this.all( conditions, function(data){
			if( data ){
				for(var i=0; i<data.length; i++)
					self.destroy( data.id, params, callback );
			}
		})
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