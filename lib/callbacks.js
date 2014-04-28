var EventEmitter = require('events').EventEmitter
	, inherits = require('util').inherits;

module.exports = Callback

function Callback (){
	var events = new EventEmitter;

	this.on = events.on;
	this.emit = events.emit;


	var _response_callback = true;
	/**
	*	Set true or false for the response of the events `<before_|after_>[create, update, destroy]`
	*	@param {Boolean} resp
	*
	*	Example:
	*	inherits(Model, ActiveRecord.Base);
	*	function Model (){};
	*	Model.super_();
	*	
	*	// Callbacks
	*	before_[create, update, destroy]:
	*		return: Object
	*	after_create:
	*		return: Object
	*	after_[update, destroy]:
	*		return: ID of the Object in Table
	*
	*	Model.on('before_create', function (data){
	*		if (data.foo = 'bar'){
	*			return this.response_callback(false)
	*		}
	*		return this.response_callback(true)
	*	})
	*
	*	Model.on('after_destroy', function (id){
	*		console.log("Model with id #", id,"destroyed");
	*	})
	*/
	this.response_callback = function response_callback(resp){
		if (1 == arguments.length && typeof(resp)=="boolean"){
			_response_callback = resp;
		} else {
			return _response_callback;
		}
	}
}