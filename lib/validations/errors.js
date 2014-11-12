var ActiveSupport = require('../active_support');

module.exports = Errors

/*
*	@alias ActiveRecord.Base.prototype.errors
*	Example:
*	var ActiveRecord = require('active_record');
*	module.exports = User;
*	ActiveRecord.Base.extend_to(User);
*	function User(attr){
*		this.attributes(attr);
*		this.validate(['presence','length'], 'name', {on: 'create', min: 6});
*		this.has_secure_password();
*	}
*
*	var user = User.create({name: '', password: 'bar'});
*	user.errors.any // return true
*	user.errors.size // 1
*	user.errors.full_messages // return ['Name can\'t be empty', 'Name can\'t be blank','Name is too short (minimum is 6 characters)']
*
*/
function Errors (){
	/*
	*
	*/
	this.messages = {};
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
	this.add = function add (item, message){
		if (!Array.isArray(this.messages[item])) this.messages[item] = [];
		this.messages[item].push(message);
	}
	/*
	*
	*/
	this.clear = function clear (){
		this.messages = {};
	}

}

Errors.prototype = {
	/*
	*
	*/
	get any (){
		return this.size > 0 ? true : false;
	},
	/*
	*
	*/
	get size (){
		return this.full_messages.length;
	},
	/*
	*
	*/
	get full_messages (){
		var messages = [];
		for (var item in this.messages){
			this.messages[item].forEach(function (value){
				messages.push(ActiveSupport.Inflector.humanize(item)+" "+value);
			})
		}
		return messages;
	}
}
