var	inherits = require('util').inherits

inherits(StandardError, Error)
function StandardError (){
	Error.call(this)
}

inherits(ActiveRecordError, StandardError)
function ActiveRecordError (message){
	StandardError.call(this);
	this.type = 'ActiveRecord';
	this.name = 'ActiveRecordError';
	this.message = message;
	this.toString = function (){
		return "\033[1;31m"+ this.type +'::'+ this.name +': \033[0;31m'+ this.message +'\033[0m';
	}
}

inherits(RecordNotFound, ActiveRecordError)
function RecordNotFound (model){
	ActiveRecordError.call(this);
	this.name = "RecordNotFound";
	this.message = "Couldn\'t find '"+ model.table_name +"' without an ID";
}

inherits(DriverNotFound, ActiveRecordError)
function DriverNotFound (driver){
	ActiveRecordError.call(this);
	this.name = "DriverNotFound";
	this.message = "Database configuration specifies nonexistent driver: '"+ driver +"'";
}

inherits(ConnectionNotEstablished, ActiveRecordError)
function ConnectionNotEstablished (message){
	ActiveRecordError.call(this);
	this.name = "ConnectionNotEstablished";
	this.message = message || "Please establish the connection with database";
	this.fatal = true;
}

inherits(StatementInvalid, ActiveRecordError)
function StatementInvalid (message){
	ActiveRecordError.call(this);
	this.name = "StatementInvalid";
	this.message = message;
}

inherits(SQLFormat, ActiveRecordError)
function SQLFormat (message){
	ActiveRecordError.call(this);
	this.name = "SQLFormat";
	this.message = message;
}

inherits(RecordInvalid, ActiveRecordError)
function RecordInvalid (message){
	ActiveRecordError.call(this);
	this.name = "RecordInvalid";
	this.message = "Validation failed: "+ message;
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
