var Query = require('./relations/query')
	, Transaction = require('./transaction');

module.exports = Helpers

/*
*   Helpers for the instances
*/
function Helpers (){
	var self = this;

	this._attributes = {};

	this.to_object = function to_object(){
		return this.constructor.extend({}, this._attributes);
	},

	this.to_json = function to_json(){
		return JSON.stringify(this.to_object());
	},

	this.keys = function keys(){
        var keys_array = [];
        for(var key_name in this._attributes){
            keys_array.push(key_name);
        }
        return keys_array;
    }

    this.values = function values(){
        var values_array = [];
        for(var key_name in this._attributes){
            values_array.push(this._attributes[key_name]);
        }
        return values_array;
    }

	this.attributes = function (){
		var descriptor = {}, self = this;
		Array.prototype.forEach.call(arguments, function (properties) {
			if (properties){
				Object.getOwnPropertyNames(properties).forEach(function(name) {
					descriptor[name] = Object.getOwnPropertyDescriptor(properties, name);
				});
			}
		});
		Object.defineProperties(this, descriptor);
	}

	/*
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({foo: `bar`})
	*	instance.save(function (data){ ... })
	*
	*/
	this.save = function ( callback ) {
		if (this.saved) return false;
		return self.create(this, function (data) {
			return callback ? callback(data) : data;
		})
	}

	/*
	*	@param {Object} params
	*	@param {Function} callback
	*	Example:
	*	instance = new Model({id: 1})
	* 	instance.update_attributes({foo: `barz`}, function (data) { ... })
	*/
	this.update_attributes = function ( params, callback ) {
		return self.update(this.id, params, function (data) {
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
	this.destroy = function ( callback ) {
		self.delete(this.id, function( data ){
			var resp = data.affectedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		delete this;
	}
}
