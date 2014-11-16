var EventEmitter = require('events').EventEmitter;

module.exports = Callback;

function Callback (){};

/*
*	@param {Function} callback
*	Example:
*	function User(){
*		this.before_create(function (){
*			console.log("Anarkhia!!!")
*		})
*	}
*/
var callbacks = ['before_destroy', 'before_create', 'before_update',
'after_destroy', 'after_create', 'after_update'].forEach(function (method){
	Callback.prototype[method] = function _callback (callback){
		this.on(method, callback);
	}
})
