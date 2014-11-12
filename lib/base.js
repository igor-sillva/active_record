var ActiveRecord = require('./active_record')
	, ActiveSupport = require('./active_support')
	, Connection = require('./connection')
	, EventEmitter = require('events').EventEmitter
	, inherits = require('util').inherits;

module.exports = Base
/*
*   Example:
*   var ActiveRecord = require('active_record');
*
*   module.exports = Model
*
*   ActiveRecord.Base.extend_to(Model)
*   function Model (){
*       this.attributes(arguments[0]);
*   }
*
*/
function Base (){}

Base.extend_to = function extend_to(destination){
	// InstanceMethods
	for ( var i in ActiveRecord.InstanceMethods ){
		var source = new ActiveRecord.InstanceMethods[i];
		for (var property in source){
			destination.prototype[property] = source[property];
		}
	}
	// ClassMethods
	for ( var i in ActiveRecord.ClassMethods ){
		var source = new ActiveRecord.ClassMethods[i];
		for (var property in source){
			destination[property] = source[property];
		}
	}
	ActiveSupport.extend(destination, {
		primary_key: 'id',
		foreign_key: null,
		table_name_prefix: '',
		table_name: this.name ? ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.underscore(this.name)) : "",
		toString: function toString(){
			var prefix = this.table_name_prefix || ''
			, name = this.table_name || '';
			return (prefix + name) ? (prefix + name) : ActiveSupport.Inflector.pluralize(this.name.toLowerCase());
		},
		to_s: this.toString, // alias
	})

	destination.prototype.__proto__ = EventEmitter.prototype;
	destination.connection = Base.connection;
	return destination;
}

Base.connection = new Connection;

/*******************************
*=-=-=-=-=-=ALIASES-=-=-=-=-=-=*
*******************************/
/*
*   @param {String|Object} config
*
*   Example:
*   Base.configure_connection({
*       driver: 'mysql',
*       ...
*   })
*   // For more examples see the `connection.js` documentation
*/
Base.configure_connection = function (config){
	Base.connection.config(config)
	.on('connect', function(data){
		console.info("\033[1;37mINFO \033[1;36mDatabase connected.\033[1;32m "+ new Date().toGMTString() +"\033[0m");
	})
	.on('disconnect', function(data){
		console.info("\033[1;37mINFO \033[1;33mDatabase disconnected.\033[1;32m "+ new Date().toGMTString() +"\033[0m")
	});

	return this;
}

/*
*   After configurated the connection, establish the connection...
*   Example:
*   Base.configure_connection(<configs>).establish_connection()
*/
Base.establish_connection = function (){
	Base.connection.connect();
	return this;
}

/*
*	Why comment this? It's obvious!
*/
Base.close_connection = function (){
	Base.connection.disconnect();
	return this;
}
