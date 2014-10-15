var Inflections = require('./inflections')
	, Action = require('./relations/actions')
	, Callback = require('./callbacks')
	, Finder = require('./relations/finders_methods')
	, Calculation = require('./relations/calculations')
	, Association = require('./associations/associations')
	, Validator = require('./validations/validations')
	, Helpers = require('./helpers')
	, Transaction = require('./transaction');

/**
*   CONSTANTS
*/
process.ACTIVERECORD = {
	CACHE: [],
	CONNECTION: null
};

module.exports = ActiveRecord

function ActiveRecord (){

	this.primary_key = 'id';
	this.foreign_key = null;
	this.table_name_prefix = '';
	this.table_name = (this.name ? this.name.underscore().pluralize() : "");

	this.toString = function toString(){
		var prefix = this.table_name_prefix || ''
		, name = this.table_name || '';
		return (prefix + name) ? (prefix + name) : this.name.toLowerCase().pluralize();
	}

}

ActiveRecord.ClassMethods = {
	Transaction: Transaction,
	Action: Action,
	Callback: Callback,
	Finder: Finder,
	Calculation: Calculation,
	Association: Association,
};

ActiveRecord.InstanceMethods = {
	Validator: Validator,
	Helpers: Helpers
};
