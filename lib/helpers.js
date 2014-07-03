var Query = require('./relations/query')
	, Transaction = require('./transaction');

module.exports = Helpers

/*
*   Helpers for the instances
*/
function Helpers (){
	var self = this;

	this.prototype.attributes = function (){
		var descriptor = {};
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
	this.prototype.save = function ( callback ) {
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
	this.prototype.update_attributes = function ( params, callback ) {
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
	this.prototype.destroy = function ( callback ) {
		self.delete(this.id, function( data ){
			var resp = data.affectedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
		delete this;
	}
}
