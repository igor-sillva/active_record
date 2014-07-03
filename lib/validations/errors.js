module.exports = Errors

function Errors (){

	this.messages = {};

	this.add = function add (item, message){
		if (!Array.isArray(this.messages[item])) this.messages[item] = [];
		this.messages[item].push(message);
	}

	this.clear = function clear (){
		this.messages = {};
	}

}

Errors.prototype = {
	get any (){
		return this.size > 0 ? true : false;
	},

	get size (){
		return this.full_messages.length;
	},

	get full_messages (){
		var messages = [];
		for (var item in this.messages){
			this.messages[item].forEach(function (value){
				messages.push(item.humanize()+" "+value);
			})
		}
		return messages;
	}
}
