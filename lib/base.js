var ActiveRecord = require('./active_record')
	, Connection = require('./connection')
	, Action = require('./relations/actions')
	, Callback = require('./callbacks')
	, Finder = require('./relations/finders_methods')
	, Calculation = require('./relations/calculations')
	, Association = require('./associations/associations')
	, Helpers = require('./helpers')
	, inherits = require('util').inherits

var Database

module.exports = Base
/*
*   Example:
*   var ActiveRecord = require('active_record').Base
*       inherits     = require('util').inherits;
*
*   module.exports = Model
*    
*   inherits(Model, ActiveRecord)
*   function Model (){
*       this.attr_accessors(arguments);
*   }
*   Mode.super_();
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
}

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
	Database = new Connection(config)
	return Database
}

/*
*   After configurated the connection, establish the connection...
*   Example:
*   Base.configure_connection(<configs>).establish_connection()
*/
Base.establish_connection = function (){
	Database.connect()
	.on('connect', function(data){
		console.info("\033[1;37mINFO \033[1;36mDatabase connected.\033[1;32m "+ new Date().toGMTString() +"\033[0m");	
	});
}