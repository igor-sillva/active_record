var ActiveSupport = require('../active_support');

module.exports = ValidatorException
/*
*	@alias ActiveRecord.Base.prototype.errors
*	Example:
*	var ActiveRecord = require('active_record');
*	module.exports = User;
*	ActiveRecord.Base.extend(User);
*	function User(attr){
		this.initialize(attr);
*		this.validate('name', { presence: { on: 'create' }, length: { min: 6 } });
*		this.has_secure_password();
*	}
*
*	var user = User.create({name: '', password: 'bar'});
*	user.errors.any // return true
*	user.errors.size // 3
*	user.errors.full_messages // return ['Name can\'t be empty', 'Name can\'t be blank','Name is too short (minimum is 6 characters)']
*/
function ValidatorException (){
	this.messages = {};
};
ValidatorException.prototype = {
	/* */
	get: function get (key){
		return this.messages[key];
	},
	/* */
	set: function set (key, value){
		if (!Array.isArray(this.get(key)) ) this.messages[key] = [];
		this.messages[key].push(value);
	},
	/*
	*	@param {String} item
	*	@param {String} message
	*	Example:
	*	function User(){
	*		this.on('before_create', function (user){
	*			if(user.name == 'root') user.errors.add('name', 'Name \'root' is a reserved word')
	*		})
	*	}
	*/
	add: function add (key, message){
		this.set(key, message);
	},
	/*
	*	Clear Object messages
	*/
	clear: function clear (){
		this.messages = {};
	},
	/* */
	remove: function remove (key){
		if (this.messages.hasOwnProperty(key)) delete this.messages[key];
	},
	/*
	*	Check if have errors
	*	@return {Boolean}
	*/
	get any (){
		return this.size > 0 ? true : false;
	},
	/*
	*	@return {Number}
	*/
	get size (){
		return this.full_messages.length;
	},
	/*
	*	@return {Array} all errors messages organized by attribute
	*	Example:
	*	// Supose if the model User have the validation of the length name for 6
	*	User.prototype.validate_length_of('name', { minimum: 6 });
	*	var user = User.create({name: 'foo'}); // return false
	*	console.log(user.errors.full_messages);
	*/
	get full_messages (){
		var messages = [];
		for (var item in this.messages){
			this.messages[item].forEach(function (value){
				if (item==='base') messages.push(ActiveSupport.Inflector.humanize(value))
				else messages.push(ActiveSupport.Inflector.humanize(item)+" "+value);
			})
		}
		return messages;
	}
}
