var Inflections = require('inflections')
  , inherits = require('util').inherits

module.exports = ActiveRecord

/*
*   CONSTANTS
*/
process.ACTIVERECORD = {};
process.ACTIVERECORD.CACHE = [];
process.ACTIVERECORD.CONNECTION;


function ActiveRecord (){
	
	this.settings = {};

	this.toString = function (){
		var prefix = this.get('table_name_prefix') || ''
		, name = this.get('table_name') || '';
		return (prefix + name) ? (prefix + name) : this.name.toLowerCase().pluralize();
	}

	this.config = function (settings){
		for(var setting in settings)
			this.set(setting, settings[setting]);
	}

	this.set = function (setting, val){
		if (1 == arguments.length) {
			if (this.settings.hasOwnProperty(setting)) {
			  return this.settings[setting];
			} else if (this.parent) {
			  return this.parent.set(setting);
			}
		} else {
			this.settings[setting] = val;
			return this;
		}
	}

	this.get = this.set
	
	/*
	*   Default Settings 
	*/
	this.config({
		table_name_prefix: null,
		table_name: this.name.underscore().pluralize(),
		primary_key: 'id',
		foreign_key: null
	})
}