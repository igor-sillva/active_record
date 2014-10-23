var Query = require('./relations/query')
	, Transaction = require('./transaction');

module.exports = Helpers

/*
*   Helpers for the instances
*/
function Helpers (){
	this._object = {};

	/*
	*
	*/
	this.set = function set(key, value){
		if (typeof(value) !== "function"){
			this._object[key] = value;
			this[key] = value;
		}
	}

	/*
	*
	*/
	this.get = function get(key){
		return this._object[key];
	}

	/*
	*
	*/
	this.to_object = function to_object(){
		return this._object;
	},

	/*
	*
	*/
	this.to_json = function to_json(){
		return JSON.stringify(this.to_object());
	},

	/*
	*
	*/
	this.keys = function keys(){
		var keys_array = [];
		for(var key_name in this._object){
			keys_array.push(key_name);
		}
		return keys_array;
	}

	/*
	*
	*/
	this.values = function values(){
		var values_array = [];
		for(var key_name in this._object){
			values_array.push(this._object[key_name]);
		}
		return values_array;
	}

	/*
	*
	*/
	this.attributes = function attributes(){
		var properties = arguments[0];
		for (var prop in properties){
			this.set(prop, properties[prop]);
		}
	}

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({foo: `bar`})
	*	instance.save(function (data){ ... })
	*
	*/
	this.save = function save( callback ) {
		if (this._saved) return false;
		return this.constructor.create(this.to_object(), function (data) {
			if (data.affectedRows == 1){
				this.set('id', data.insertId);
			}
			return callback ? callback(data) : data;
		}.bind(this))
	}

	/*
	*	@param {Object} params
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	* 	instance.update_attributes({foo: `barz`}, function (data) { ... })
	*/
	this.update_attributes = function update_attributes(params, callback) {
		if(typeof(params)=="function"){
			callback = params;
		}
		if (typeof(params)=='object'){
			for (var key in params){
				this.set(key, params[key]);
			}
		}
		params = params || this.to_object();
		return this.constructor.update(this.get('id'), params, function (data) {
			var resp = data.changedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
	}

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	*	instance.destroy(function (data){ ... })
	*/
	this.destroy = function destroy( callback ) {
		this.constructor.destroy(this.get('id'), function( data ){
			var resp = data.affectedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		delete this;
	}
}
