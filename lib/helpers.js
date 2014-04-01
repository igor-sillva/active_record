var Query = require('./relations/query')
	, Transaction = require('./transaction');

module.exports = Helpers

/*
*   Helpers for the instances	
*/
function Helpers (){
	var Model = this;

	/*
	* 
	*/
	this.prototype.attr_readers = function (){
		var readers = {};
		for (var i in this) {
			var arg = this[i];
			if (typeof  arg != 'function'){
				readers[i] = arg;				
			}
		}
		return readers;
	};
	
	/*
	*	
	*/
	this.prototype.attr_accessor = function () {
		var descriptor = {};

		Array.prototype.forEach.call(arguments[0], function (properties) {
			Object.getOwnPropertyNames(properties).forEach(function(name) {
				descriptor[name] = Object.getOwnPropertyDescriptor(properties, name);
			});
		});
		Object.defineProperties(this, descriptor);
	}
    
	/*
	*	
	*/
	this.prototype.save = function ( callback ) {
		return Model.create(this.attr_readers(), function (data) {
			return callback ? callback(data) : data;
		})
	}

	/*
	*	
	*/
	this.prototype.update_attributes = function ( params, callback ) {
		return Model.update( this['id'], params, function (data) {
			return callback ? callback(data) : data;
		})
	}

	/*
	*	
	*/
	this.prototype.destroy = function ( callback ) {
		return Model.destroy(this['id'], function( data ){
			return callback ? callback(data) : data;
		})
	}
	
}