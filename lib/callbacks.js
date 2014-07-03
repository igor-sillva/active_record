var EventEmitter = require('events').EventEmitter;

module.exports = Callback;

function Callback (){
	EventEmitter.call(this);
}
