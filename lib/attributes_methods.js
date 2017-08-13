var Query = require('./relations/query')
	, ActiveSupport = require('./active_support')
	, Exception = require('./error')
	, ValidatorException = require('./validations/errors');

module.exports = AttributesMethods

/*
*   AttributesMethods for the instances
*/
function AttributesMethods (){}

AttributesMethods.prototype = {
	/* */
	initialize: function initialize (attributes){
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
		/* Set Attributes */
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
			if (this.get(key) && this.get(key) != value){
				if (!this.changes.hasOwnProperty(key)) this.changes[key] = [];
				this.changes[key].push(this.get(key), value);
			}
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
		return this.to_object();
	},

	/*
	* Check if record is valid
	* @return {Boolean}
	*/
	is_valid: function is_valid(){
		return this._valid = this.errors.any ? false : true
	},

	/*
	* Check if record was modified
	* @return {Boolean}
	*/
	changed: function changed(key){
		var changes = this.changes;
		var params = this.to_object()
		for (key in params){
			if (this.get(key) != params[key]){
				if (!changes.hasOwnProperty(key)) 
					changes[key] = [];
				changes[key].push(this.get(key), params[key]);
			}
		}
		return ActiveSupport.keys(changes).length > 0 ? true : false;
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
		if (this.new_record == false && this.changed() && !this.destroyed)
			return this.update_attributes(this.to_object(), callback);

		if (this.errors.any) {
			var RecordInvalid = new Exception.RecordInvalid(this.errors.full_messages.join(', '));
			console.error(RecordInvalid.toString())
			callback ? callback(RecordInvalid, null) : RecordInvalid;
			return false;
		}

		var saved_record = this.constructor.create(this.to_object(), function (error, response, record) {
			if (response && response.affectedRows > 0)
				this.set(this.constructor.primary_key, response.insertId);
			
			return callback ? callback.call(this, error, record) : response;
		}.bind(this));

		if (!saved_record.errors.any){
			if (this.password_digest) 
				this.password_digest = saved_record.password_digest;

			this.new_record         = saved_record.new_record;
			var saved_record_object = saved_record.to_object();

			for (var key in saved_record_object)
				this.set(key, saved_record_object[key]);
			
			this.changes = {};
			return true;
		}

		this._valid          = saved_record.is_valid();
		this.errors.messages = saved_record.errors.messages;
		return false;
	},

	/*
	*	@param {Object} params
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	* instance.update_attributes({foo: `barz`}, function (data) { ... })
	*/
	update_attributes: function update_attributes(attributes, callback) {

		var updated_record = 
		this.constructor.update.call(this, this.get(this.constructor.primary_key), attributes,
			function _update_attributes(error, response, record) {
				var response = response && response.changedRows >= 1 ? true : false;
				return callback ? callback.call(this, error, response) : response;
			});

		if (updated_record){
			var updated_record_object = updated_record.to_object();
			
			for (var key in updated_record_object)
				this.set(key, updated_record_object[key]);
			
			this._valid          = updated_record.is_valid();
			this.errors.messages = updated_record.errors.messages;
		}
	},

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	*	instance.destroy(function (data){ ... })
	*/
	destroy: function destroy( callback ) {
		if (this.destroyed) return false;

		var destroyed_record = this.constructor.destroy.call(this, 
			this.get(this.constructor.primary_key),
			function(error, response, record){
				if (error) 
					return callback ? callback.call(this, error, null) : error;
				
				if (response){
					var response = response.affectedRows >= 1 ? true : false;
					return callback ? callback.call(this, error, response) : response;
				}
			}.bind(this));

		if (destroyed_record) 
			this.destroyed = destroyed_record.destroyed;
		Object.freeze(this);
		Object.freeze(this._object);
	}

}

