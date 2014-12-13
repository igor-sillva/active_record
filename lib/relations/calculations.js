var Query = require('./query');

module.exports = Calculations

function Calculations (){
	/**
	*	@param {String} column_name
	*	@param {Object|Array} conditions
	* 	@param {Function} callback
	*
	*	Example:
	*	count('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	count('name', ['id > ?', 100], function(data){
	*		console.log(data)
	*	})
	*/
	this.count = function count( column_name, conditions, callback ){
		var options = {}
			, column_name = column_name || '*'
			, conditions = conditions || {};
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = '*';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {};
		}
		options = {
			from: this.to_s(),
			select: "COUNT("+ column_name +")",
			conditions: conditions
		}
		var query = new Query().make_select(options);
		return this.exec(query.sql, query.values, callback );
	}

	/**
	*	@param {String} column_name
	*	@param {Object|Array} conditions
	* 	@param {Function} callback
	*
	*	Example:
	*	average('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	average('name', ['id > ?', 100], function(data){
	*		console.log(data)
	*	})
	*/
	this.average = function average( column_name, conditions, callback ){
		var self = this;
		var options = {}
			, column_name = column_name || 'id'
			, conditions = conditions || {};
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {};
		}
		options = {
			from: this.to_s(),
			select: "AVG("+ column_name +")",
			conditions: conditions
		}
		var query = new Query().make_select(options);
		return this.exec(query.sql, query.values, callback );
	}

	/**
	*	@param {String} column_name
	*	@param {Object|Array} conditions
	* 	@param {Function} callback
	*
	*	Example:
	*	minimum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	minimum('name', ['id > ?', 100], function(data){
	*		console.log(data)
	*	})
	*/
	this.minimum = function minimum( column_name, conditions, callback ){
		var options = {}
			, column_name = column_name || 'id'
			, conditions = conditions || {};
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {};
		}
		options = {
			from: this.to_s(),
			select: "MIN("+ column_name +")",
			conditions: conditions
		}
		var query = new Query().make_select(options);
		return this.exec( query.sql, query.values, callback );
	}

	/**
	*	@param {String} column_name
	*	@param {Object|Array} conditions
	* 	@param {Function} callback
	*
	*	Example:
	*	maximum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	maximum('name', ['id > ?', 100], function(data){
	*		console.log(data)
	*	})
	*/
	this.maximum = function maximum( column_name, conditions, callback ){
		var options = {}
			, column_name = column_name || 'id'
			, conditions = conditions || {};
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {};
		}
		options = {
			from: this.to_s(),
			select: "MAX("+ column_name +")",
			conditions: conditions
		}
		var query = new Query().make_select(options);
		return this.exec( query.sql, query.values, callback );
	}

	/**
	*	@param {String} column_name
	*	@param {Object|Array} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*
	*	Example:
	*	sum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	sum('name', ['id > ?', 100], function(data){
	*		console.log(data)
	*	})
	*/
	this.sum = function sum( column_name, conditions, callback ){
		var options = {}
			, column_name = column_name || 'id'
			, conditions = conditions || {};
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = {};
		}
		options = {
			from: this.to_s(),
			select: "SUM("+ column_name +")",
			conditions: conditions
		}
		var query = new Query().make_select(options);
		return this.exec( query.sql, query.values, callback );
	}

	/**
	* 	Alias:
	* 	`avg` average
	*	`min` minimum
	* 	`max` maximum
	*/
	this.avg = this.average
	this.min = this.minimum
	this.max = this.maximum


}
