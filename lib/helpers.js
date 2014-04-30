var Query = require('./relations/query')
	, Transaction = require('./transaction');

module.exports = Helpers

/*
*   Helpers for the instances	
*/
function Helpers (){
	var Model = this;

	var _attr = {};

	this.prototype.attributes = function (){
		var descriptor = {};
		Array.prototype.forEach.call(arguments, function (properties) {
			if (properties){
				Object.getOwnPropertyNames(properties).forEach(function(name) {
					descriptor[name] = Object.getOwnPropertyDescriptor(properties, name);
					if (typeof(properties[name])!="function"){
						_attr[name] = properties[name];
					}
				});
			}
		});
		Object.defineProperties(this, descriptor);
		return this;
	}
    
	/*
	*	
	*/
	this.prototype.save = function ( callback ) {
		if (this.saved) return false;
		return Model.create(_attr, function (data) {
			return callback ? callback(data) : data;
		})
	}

	/*
	*	
	*/
	this.prototype.update_attributes = function ( params, callback ) {
		return Model.update( this.id, params, function (data) {
			var resp = data.changedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
	}

	/*
	*	
	*/
	this.prototype.destroy = function ( callback ) {
		return Model.destroy( this.id, function( data ){
			var resp = data.changedRows >= 1 ? true : false;
			return callback ? callback(resp) : resp;
		})
	}
	
}