var Query = require('./relations/query')
	, ActiveSupport = require('./active_support')
	, Exception = require('./error')
	, ValidatorException = require('./validations/errors');

module.exports = AttributesMethods

/*
*   AttributesMethods for the instances
*/
function AttributesMethods (){

	/* @property {Object} */
	this._object = {};
	/* @property {Boolean} */
	this._valid = true;
	/* @property {Boolean} */
	this.new_record = true;
	/* @property {Boolean} */
	this.destroyed = false;
	/* @property {Object} */
	this.changes = {}; // {field_name: [new_data, old_data]}
	/* */
	this.errors = new ValidatorException;

}

AttributesMethods.prototype = {
	/* */
	initialize: function initialize (attributes){
		AttributesMethods.call(this);
		this.attributes(attributes || {});
	},
	/*
	*	@param {String} key
	*	@param {String} value
	*	Example:
	*	set('name', 'foo')
	*/
	set: function set(key, value){
		if (key && typeof(value) !== "function"){
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
	attributes: function attributes (properties){
		for (var prop in properties){
			this.set(prop, properties[prop]);
		}
		return this._object;
	},

	/*
	* Check if record is valid
	* @return {Boolean}
	*/
	is_valid: function is_valid(){
		var _is_valid = this.errors.any ? false : true
		this._valid = _is_valid
		return _is_valid;
	},

	/*
	* Check if record as modified
	* @return {Boolean}
	*/
	changed: function changed(){
		return ActiveSupport.keys(this.changes).length > 0 ? true : false;
	},

	/*
	*	@return "<#Klass>"
	*/
	toString: function toString (){
		return "<#"+ this.constructor.name +">";
	},

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({foo: `bar`})
	*	instance.save(function (data){ ... })
	*
	*/
	save: function save( callback ) {
		if (this.new_record===false) return this;
		if (this.errors.any) {
			var RecordInvalid = new Exception.RecordInvalid(this.errors.full_messages.join(', '));
			console.error(RecordInvalid.toString())
			callback ? callback(RecordInvalid, null) : RecordInvalid;
			return this;
		}

		var saved_record = this.constructor.create(this.to_object(), function (error, response, record) {
			if (response.affectedRows>0){
				this.set(this.constructor.primary_key, response.insertId);
			}
			return callback ? callback.call(this, error, record, response) : response;
		}.bind(this));

		if (!saved_record.errors.any){
			this.saved_record = saved_record.new_record;
			this._valid          = saved_record.is_valid();
			this.errors.messages = saved_record.errors.messages;

			var saved_record_object = saved_record.to_object();
			for (var key in saved_record_object){
				this.set(key, saved_record_object[key]);
			}
		}
		return this;
	},

	/*
	*	@param {Object} params
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	* 	instance.update_attributes({foo: `barz`}, function (data) { ... })
	*/
	update_attributes: function update_attributes(attributes, callback) {

		var updated_record = this.constructor.update.call(this, this.get('id'), attributes, function _update_attributes(error, response, record) {
			var response = response && response.changedRows >= 1 ? true : false;
			return callback ? callback.call(this, error, response) : response;
		});

		if (updated_record){
			var updated_record_object = updated_record.to_object();
			for (var key in updated_record_object){
				this.set(key, updated_record_object[key]);
			}
			this._valid          = updated_record.is_valid();
			this.errors.messages = updated_record.errors.messages;
		}

		return this;
	},

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	*	instance.destroy(function (data){ ... })
	*/
	destroy: function destroy( callback ) {
		if (this.destroyed) return false;
		var destroyed_record = this.constructor.delete.call(this, this.get('id'), function(error, response, record){
			var response = response && response.affectedRows >= 1 ? true : false;
			return callback ? callback.call(this, error, response) : response;
		}.bind(this));

		this.destroyed = destroyed_record.destroyed;
		return ActiveSupport.freeze(this);
	}

}

