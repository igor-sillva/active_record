module.exports = Callback;

/*
*	@param {Function} callback
*	Example:
*	function User(){
*		this.before_create(function (){
*			console.log("Anarkhia!!!")
*		})
*	}
*/
function Callback (){
	var self = this;
	var callbacks = [
		'before_destroy', 
		'before_create', 
		'before_update', 
		'before_find',
		'after_destroy', 
		'after_create', 
		'after_update', 
		'after_find'
	].forEach(function (method){
		self[method] = function _callback (callback){
			this.on(method, callback);
		}
	})
};

var callbacks = [
	'before_destroy', 
	'before_create', 
	'before_update',
	'after_destroy', 
	'after_create', 
	'after_update'
].forEach(function (method){
	Callback.prototype[method] = function _callback (callback){
		this.on(method, callback.bind(this));
	}
})
