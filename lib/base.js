var ActiveRecord = require('./active_record')
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
*   ActiveRecord.Base.extend(Model, ActiveRecord.Base)
*   function Model (){
*       this.attributes(arguments[0]);
*   }
*
*/
function Base (){}

Base.extend = function extend(destination, source){
    for (var property in source){
        destination[property] = source[property];
    }
    if (destination !== this){
    	destination.prototype = Base.prototype
    }
    return destination;
}

// Instance Methods
for ( var i in ActiveRecord.InstanceMethods ){
	Base.extend(Base.prototype, new ActiveRecord.InstanceMethods[i]);
}
Base.prototype.__proto__ = EventEmitter.prototype;

// Class Methods
Base.extend(Base, new ActiveRecord)
for ( var i in ActiveRecord.ClassMethods ){
	Base.extend(Base, new ActiveRecord.ClassMethods[i]);
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
