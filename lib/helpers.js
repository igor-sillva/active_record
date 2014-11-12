var Query = require('./relations/query')
	, ActiveSupport = require('./active_support')
	, Exception = require('./error');

module.exports = Helpers

/*
*   Helpers for the instances
*/
function Helpers (){
	this._object = {};
	this.valid = true;
	this.errors = null;
	this.new_record = true;

	/*
	*	@param {String} key
	*	@param {String} value
	*	Example:
	*	set('name', 'foo')
	*/
	this.set = function set(key, value){
		if (typeof(value) !== "function"){
			this._object[key] = value;
			this[key] = value;
		}
	}

	/*
	*	@param {String} key
	*	Example:
	*	get('name')
	*/
	this.get = function get(key){
		return this._object[key];
	}

	/*
	*
	*/
	this.to_object = function to_object(){
		return ActiveSupport.clone(this._object);
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
	this.keys = function keys (){
		return ActiveSupport.keys(this.to_object());
	}

	/*
	*
	*/
	this.values = function values () {
		return ActiveSupport.values(this.to_object());
	}

	/*
	*
	*/
	this.attributes = function attributes(){
		this._object = {};
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
		if (this.new_record===false) return false;
		if (this.errors.any) throw new Exception.RecordInvalid(this.errors.full_messages.join(', ')).toString();
		var transaction = this.constructor.create(this.to_object(), function (data) {
			if (data.affectedRows == 1){
				this.set('id', data.insertId);
			}
			return callback ? callback(data) : data;
		}.bind(this))
		this.new_record = true;
		return this;
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
		var attributes = params || this.to_object();
		var transaction = this.constructor.update(this.get('id'), attributes, function (data) {
			var resp = data.changedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		return this;
	}

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	*	instance.destroy(function (data){ ... })
	*/
	this.destroy = function destroy( callback ) {
		var transaction = this.constructor.destroy(this.get('id'), function( data ){
			var resp = data.affectedRows >= 1 ? true : false;
			if (resp==true) delete this;
			return callback ? callback(resp) : resp;
		})
	}
}
