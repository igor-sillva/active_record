var Query = require('./relations/query')
	, ActiveSupport = require('./active_support')
	, Exception = require('./error')
	, ValidatorException = require('./validations/errors');

module.exports = Helpers

/*
*   Helpers for the instances
*/
function Helpers (){

	this._object = {};
	this._valid = true;
	this.new_record = true;
	this.errors = new ValidatorException;
	/*
	* Check if record is _valid
	* @return {Boolean}
	*/
	this.is_valid = function is_valid(){
		var check_if_is_valid = this.errors.any ? false : true
		this._valid = check_if_is_valid
		return check_if_is_valid;
	};

}

Helpers.prototype = {
	/*
	*	@param {String} key
	*	@param {String} value
	*	Example:
	*	set('name', 'foo')
	*/
	set: function set(key, value){
		if (typeof(value) !== "function"){
			this._object[key] = value;
			this[key] = value;
		}
	},

	/*
	*	@param {String} key
	*	Example:
	*	get('name')
	*/
	get: function get(key){
		return this._object[key];
	},

	/*
	*	@return {Object}
	*/
	to_object: function to_object(){
		return ActiveSupport.clone(this._object);
	},

	/*
	*	@return {String}
	*/
	to_json: function to_json(){
		return JSON.stringify(this.to_object());
	},

	/*
	*	@return {Array}
	*/
	keys: function keys (){
		return ActiveSupport.keys(this.to_object());
	},

	/*
	*	@return {Array}
	*/
	values: function values () {
		return ActiveSupport.values(this.to_object());
	},

	/*
	*	Set the attributes to the model
	*	@param {Object} properties
	*/
	attr_accessible: function attr_accessible (properties){
		for (var prop in properties){
			this.set(prop, properties[prop]);
		}
	},

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({foo: `bar`})
	*	instance.save(function (data){ ... })
	*
	*/
	save: function save( callback ) {
		if (this.new_record===false) return false;
		if (this.errors.any) throw new Exception.RecordInvalid(this.errors.full_messages.join(', ')).toString();

		var new_record = this.constructor.create(this.to_object(), function (data) {
			return callback ? callback(data) : data;
		}.bind(this));

		if (new_record.new_record===false){
			this.set(this.constructor.primary_key, new_record.get(this.constructor.primary_key));
		}

		this.new_record      = new_record.new_record;
		this._valid          = new_record.is_valid();
		this.errors.messages = new_record.errors.messages
		return new_record;
	},

	/*
	*	@param {Object} params
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	* 	instance.update_attributes({foo: `barz`}, function (data) { ... })
	*/
	update_attributes: function update_attributes(params, callback) {
		if(typeof(params)=="function"){
			callback = params;
		}
		if (typeof(params)=='object'){
			for (var key in params){
				this.set(key, params[key]);
			}
		}
		var attributes = params || this.to_object();
		var record_updated = this.constructor.update(this.get('id'), attributes, function (data) {
			var resp = data.changedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		return record_updated;
	},

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	*	instance.destroy(function (data){ ... })
	*/
	destroy: function destroy( callback ) {
		var record_destroyed = this.constructor.destroy(this.get('id'), function( data ){
			var resp = data.affectedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		return record_destroyed;
	}

}

