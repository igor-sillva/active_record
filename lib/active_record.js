var Inflections = require('inflections')
  , inherits = require('util').inherits

module.exports = ActiveRecord

/**
*   CONSTANTS
*/
process.ACTIVERECORD = {};
/**
*	The CACHE only work if you using callback
* 	Example:
*	Model.find('last', function(){
*		Model.find('last')
*	})
*
*	TODO: if you can fix it. Thank you :)
*/
process.ACTIVERECORD.CACHE = [];
process.ACTIVERECORD.CONNECTION;

process.ACTIVERECORD.DEBUG = true;

function ActiveRecord (){
	
	 var settings = {};
	 var self = this;

	this.toString = function toString(){
		var prefix = this.get('table_name_prefix') || ''
		, name = this.get('table_name') || '';
		return (prefix + name) ? (prefix + name) : this.name.toLowerCase().pluralize();
	}

	this.set = function (setting, val){
		if (1 == arguments.length) {
			if (settings.hasOwnProperty(setting)) {
			  return settings[setting];
			} else if (this.parent) {
			  return this.parent.set(setting);
			}
		} else {
			settings[setting] = val;
			return this;
		}
	}

	this.get = this.set;
	

	var config = function config(settings){
		for(var setting in settings)
			self.set(setting, settings[setting]);
	}
	/**
	*   Default Settings 
	*	{
	*		table_name_prefix: null,
	*		table_name: this.name.undescore().pluralize(),
	*		primary_key: 'id',
	*		foreign_key: null
	*	}
	*/
	config({
		table_name_prefix: null,
		table_name: this.name.underscore().pluralize(),
		primary_key: 'id',
		foreign_key: null
	})
}