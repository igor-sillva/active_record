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

/*
*	This function is to initialize variables for the instances
*	Example:
*	_valid, new_record, errors, _object, is_valid
*/
Base.initialize_instance_variables = function initialize (){
	for (var i in ActiveRecord.InstanceMethods){
		ActiveRecord.InstanceMethods[i].call(this);
	}
}

/*
*	Extends Methods to Model
*	@param {Function} destination
*	@return {Function}
*/
Base.extend_to = function extend_to(destination){

	/*	InstanceMethods
	*	{ Callback: [Function: Callback],
	*	  Validator: [Function: Validator],
	*	  Helpers: [Function: Helpers] }
	*/
	destination.prototype =
	ActiveSupport.extend({},
		ActiveRecord.InstanceMethods.Callback.prototype,
		ActiveRecord.InstanceMethods.Validator.prototype,
		ActiveRecord.InstanceMethods.Helpers.prototype,
		EventEmitter.prototype
	)
	destination.prototype.constructor = destination;
	/*	ClassMethods
	*
	*	{ Transaction: [Function: Transaction],
	*	  Action: [Function: Action],
	*	  Finder: [Function: Finder],
	*	  Calculation: [Function: Calculations],
	*	  Association: [Function: Association] }
	*/
	for ( var method in ActiveRecord.ClassMethods ){
		ActiveSupport.extend(destination, new ActiveRecord.ClassMethods[method]);
	}

	ActiveSupport.extend(destination, {
		/* Default primary_key ID */
		primary_key: 'id',
		/* Default foreign_key NULL */
		foreign_key: null,
		/* Default table_name_prefix '' */
		table_name_prefix: '',
		/* Default table_name Class.name.undescore.pluralize */
		table_name: destination.name ? ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.underscore(destination.name)) : "",
		/*
		*	@return table_name_prefix + table_name
		*/
		to_s: function to_s (){
			var prefix = this.table_name_prefix || ''
			, name = this.table_name || '';
			return (prefix + name) ? (prefix + name) : ActiveSupport.Inflector.pluralize(this.name.toLowerCase());
		},
		/* Connection to Database */
		connection: Base.connection
	});

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
