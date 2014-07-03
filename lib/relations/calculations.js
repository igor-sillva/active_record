var Query = require('./query');

module.exports = Calculations

function Calculations (){
	var self = this;
	/**
	*	@param {String} column_name
	*	@param {Object|String} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*	
	*	Example:
	*	count('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	count('name', 'id > ?', [100], function(data){
	*		console.log(data)
	*	})
	*/
	this.count = function count( column_name, conditions, values, callback ){
		var options = {}, query = ''
			column_name = column_name || '*'
			conditions = conditions || null
			values = values || []
		if(typeof(column_name)=="function"){
			callback = column_name
			column_name = '*'
		}
		if(typeof(conditions)=="function"){
			callback = conditions
			conditions = null
		}
		if(typeof(values)=="function"){
			callback = values
			values = []
		}
		options = {
			from: this.toString(),
			select: "COUNT("+ column_name +")",
			conditions: conditions
		}
		query = new Query().make_select(options)
		return self.exec_query(query, values, callback )
	}

	/**
	*	@param {String} column_name
	*	@param {Object|String} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*	
	*	Example:
	*	average('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	average('name', 'id > ?', [100], function(data){
	*		console.log(data)
	*	})
	*/
	this.average = function average( column_name, conditions, values, callback ){
		var options = {}, query = '';
			column_name = column_name || 'id';
			conditions = conditions || null;
			values = values || [];
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = null;
		}
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		options = {
			from: this.toString(),
			select: "AVG("+ column_name +")",
			conditions: conditions
		}
		query = new Query().make_select(options)
		return self.exec_query(query, values, callback )
	}

	/**
	*	@param {String} column_name
	*	@param {Object|String} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*	
	*	Example:
	*	minimum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	minimum('name', 'id > ?', [100], function(data){
	*		console.log(data)
	*	})
	*/
	this.minimum = function minimum( column_name, conditions, values, callback ){
		var options = {}, query = '';
			column_name = column_name || 'id';
			conditions = conditions || null;
			values = values || [];
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = null;
		}
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		options = {
			from: this.toString(),
			select: "MIN("+ column_name +")",
			conditions: conditions
		}
		query = new Query().make_select(options)
		return self.exec_query(query, values, callback )
	}

	/**
	*	@param {String} column_name
	*	@param {Object|String} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*	
	*	Example:
	*	maximum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	maximum('name', 'id > ?', [100], function(data){
	*		console.log(data)
	*	})
	*/
	this.maximum = function maximum( column_name, conditions, values, callback ){
		var options = {}, query = '';
			column_name = column_name || 'id';
			conditions = conditions || null;
			values = values || [];
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = null;
		}
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		options = {
			from: this.toString(),
			select: "MAX("+ column_name +")",
			conditions: conditions
		}
		query = new Query().make_select(options)
		return self.exec_query(query, values, callback )
	}

	/**
	*	@param {String} column_name
	*	@param {Object|String} conditions
	*	@param {Array} values
	* 	@param {Function} callback
	*	
	*	Example:
	*	sum('name', function(data){
	*		console.log(data)
	* 	})
	*
	*	sum('name', 'id > ?', [100], function(data){
	*		console.log(data)
	*	})
	*/
	this.sum = function sum( column_name, conditions, values, callback ){
		var options = {}, query = '';
			column_name = column_name || 'id';
			conditions = conditions || null;
			values = values || [];
		if(typeof(column_name)=="function"){
			callback = column_name;
			column_name = 'id';
		}
		if(typeof(conditions)=="function"){
			callback = conditions;
			conditions = null;
		}
		if(typeof(values)=="function"){
			callback = values;
			values = [];
		}
		options = {
			from: this.toString(),
			select: "SUM("+ column_name +")",
			conditions: conditions
		}
		query = new Query().make_select(options)
		return self.exec_query(query, values, callback )
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