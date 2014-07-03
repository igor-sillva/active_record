var ActiveRecord = require('./active_record')
	, Connection = require('./connection')
	, Action = require('./relations/actions')
	, Callback = require('./callbacks')
	, Finder = require('./relations/finders_methods')
	, Calculation = require('./relations/calculations')
	, Association = require('./associations/associations')
	, Validator = require('./validations/validations')
	, Helpers = require('./helpers')
	, Transaction = require('./transaction')
	, EventEmitter = require('events').EventEmitter
	, inherits = require('util').inherits;

module.exports = Base
/*
*   Example:
*   var ActiveRecord = require('active_record')
*       inherits     = require('util').inherits;
*
*   module.exports = Model
*
*   inherits(Model, ActiveRecord.Base)
*   function Model (){
*       this.attributes(arguments);
*   }
*   Model.super_();
*
*/
inherits(Base, ActiveRecord)
function Base (){
	ActiveRecord.call(this);
	Action.call(this);
	Association.call(this);
	Calculation.call(this);
	Callback.call(this);
	Finder.call(this);
	Helpers.call(this);
	Transaction.call(this);
	Validator.call(this);
}

Base.prototype.__proto__ = EventEmitter.prototype

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
