var Inflections = require('./inflections');
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
	this.table_name = this.name ? this.name.underscore().pluralize() : "";

	this.toString = function toString(){
		var prefix = this.table_name_prefix || ''
		, name = this.table_name || '';
		return (prefix + name) ? (prefix + name) : this.name.toLowerCase().pluralize();
	}

}

ActiveRecord.extend = function extend(destination, source){
    for (var property in source){
        destination[property] = source[property];
    }
    return destination;
}
