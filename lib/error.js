var	inherits = require('util').inherits

inherits(StandardError, Error)
function StandardError (){
	Error.call(this)
}

inherits(ActiveRecordError, StandardError)
function ActiveRecordError (){
	StandardError.call(this);
	this.type = 'ActiveRecord';
	this.toString = function (){
		// console.error("\033[1;31m"+ this.type +"::"+ this.name +" \033[0;37m\""+ this.message+"\"\033[0m");
		return this.type +'::'+ this.name +': '+ this.message;
	}

}

inherits(RecordNotFound, ActiveRecordError)
function RecordNotFound (model){
	ActiveRecordError.call(this);
	this.name = "RecordNotFound";
	this.message = "Couldn\'t find '"+ model.get('table_name') +"' without an ID";
}

inherits(DriverNotFound, ActiveRecordError)
function DriverNotFound (driver){
	ActiveRecordError.call(this);
	this.name = "DriverNotFound";
	this.message = "Database configuration specifies nonexistent "+driver+" driver";
}

inherits(ConnectionNotEstablished, ActiveRecordError)
function ConnectionNotEstablished (message){
	ActiveRecordError.call(this);
	this.name = "ConnectionNotEstablished";
	this.message = message;
	this.fatal = true;
}

inherits(StatementInvalid, ActiveRecordError)
function StatementInvalid (message){
	ActiveRecordError.call(this);
	this.name = "StatementInvalid";
	this.message = message;
}

/**
*	Exports all Errors
*/
module.exports = exports = {
	RecordNotFound: RecordNotFound,
	DriverNotFound: DriverNotFound,
	ConnectionNotEstablished: ConnectionNotEstablished,
	StatementInvalid: StatementInvalid,
}