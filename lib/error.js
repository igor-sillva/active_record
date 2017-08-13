var ActiveSupport = require('./active_support');
var	inherits = require('util').inherits

inherits(StandardError, Error)
function StandardError (){
	Error.call(this)
}

inherits(ActiveRecordError, StandardError)
function ActiveRecordError (message){
	StandardError.call(this);
	this.code = 'ActiveRecordError';
	this.name = 'ActiveRecord::'+this.code;
	this.message = message;
	/*
	* return "\033[1;31m<type>::<code>: \033[0;31m<message>\033[0m"
	*/
	this.toString = function toString(){
		return "\033[1;31m"+ this.name +':\033[0;31m'+ this.message +'\033[0m';
	}
}

inherits(RecordNotFound, ActiveRecordError)
function RecordNotFound (message){
	ActiveRecordError.call(this);
	this.code = "RecordNotFound";
	this.name = 'ActiveRecord::'+this.code;
	this.message = " "+ message;
}

inherits(DriverNotFound, ActiveRecordError)
function DriverNotFound (driver){
	ActiveRecordError.call(this);
	this.code = "DriverNotFound";
	this.name = 'ActiveRecord::'+this.code;
	this.message = " Database configuration specifies nonexistent driver: '"+ driver +"'";
}

inherits(ConnectionNotEstablished, ActiveRecordError)
function ConnectionNotEstablished (message){
	ActiveRecordError.call(this);
	this.code = "ConnectionNotEstablished";
	this.name = 'ActiveRecord::'+this.code;
	this.message = message || " Please establish the connection with database";
	this.fatal = true;
}

inherits(StatementInvalid, ActiveRecordError)
function StatementInvalid (message){
	ActiveRecordError.call(this);
	this.code = "StatementInvalid";
	this.name = 'ActiveRecord::'+this.code;
	this.message = " "+ message;
}

inherits(SQLFormat, ActiveRecordError)
function SQLFormat (message){
	ActiveRecordError.call(this);
	this.code = "SQLFormat";
	this.name = 'ActiveRecord::'+this.code;
	this.message = " "+ message;
}

inherits(RecordInvalid, ActiveRecordError)
function RecordInvalid (message){
	ActiveRecordError.call(this);
	this.code = "RecordInvalid";
	this.name = 'ActiveRecord::'+this.code;
	this.message = " Validation failed: "+ message;
}

/**
*	Exports all Errors
*/
module.exports = exports = {
	ActiveRecordError: ActiveRecordError,
	RecordNotFound: RecordNotFound,
	DriverNotFound: DriverNotFound,
	ConnectionNotEstablished: ConnectionNotEstablished,
	StatementInvalid: StatementInvalid,
	SQLFormat: SQLFormat,
	RecordInvalid: RecordInvalid
}
