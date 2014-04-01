var EventEmitter = require('events').EventEmitter
	, inherits = require('util').inherits;

module.exports = Callback

function Callback (){
	var events = new EventEmitter;

	this.on = events.on;
	this.emit = events.emit;

}