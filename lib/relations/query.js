var Exception = require('../error')
	, ActiveRecord = require('../active_record')
	, ActiveSupport = require('../active_support')
	, MySQLEscape = require('mysql').escape
	, escapeId = require('mysql').escapeId;

var singularize  = ActiveSupport.Inflector.singularize;
var _foreign_key = ActiveSupport.Inflector.foreign_key


module.exports = Query

/* Esto és una BAGACERA, TCHOMANO! */
function Query (){
	/**
	*	@param {Object} options
	*
	* Example:
	*	make_select({
	*		from: 'users',
	*		select: ['name', 'role_id as role'],
	*		conditions: {
	*			where: 'id',
	*			in : [1,2,3,4,5]
	*		},
	*		order: 'id',
	*		group: 'role_id',
	*	})
	*	return "SELECT name, role_id as role FROM users WHERE id IN (1,2,3,4,5) ORDER BY name GROUP BY role_id"
	*
	*	# Create Join
	*	make_select({
	*		from: 'users',
	*		include: 'phones',// include or join
	*	})
	*	return "SELECT * FROM users INNER JOIN phones ON phones.user_id = users.id"
	*/
	this.make_select = function (options){
		options = options || {};
		var table_name  = options.from;
		var select      = options.select || table_name +'.*';
		var include     = options.include || options.join || '';
		var conditions  = isObject(options.conditions) ? ActiveSupport.clone(options.conditions || {}) : options.conditions;
		var order       = options.order || '';
		var group       = options.group || '';
		var limit       = options.limit || '';
		var offset      = options.offset || '';
		var primary_key = options.primary_key;
		var foreign_key = options.foreign_key || _foreign_key(singularize(table_name));
		var extras      = options.extras || '';

		var sql_string = 'SELECT :select FROM :table:include:conditions:order:group:limit:offset';

		/* JOIN */
		if ( options.include || options.join ){
			var inc = options.include || options.join;
			var direction = inc.direction ? inc.direction : ' INNER';
			var join = inc.join ? inc.join : inc;
			var on = (inc.on ? inc.on : inc) +'.'+ foreign_key +' = '+ table_name +'.'+ primary_key;
			include = direction +' JOIN '+ join +' ON '+ on;
		}

		/* WHERE */
		if (conditions) {
			if (isObject(conditions)){
				for (key in conditions){
					conditions[table_name + "." + key] = conditions[key];
					delete conditions[key];
				}
			}
			conditions = this.sanitizeConditions(conditions);
		}
		if (extras) conditions.params = [conditions.params, extras].join(' AND ');
		/* SQL */
		return {
			sql: Query.format(sql_string, {
				select: select,
				table: table_name,
				include: include,
				conditions: conditions.params || extras ? " WHERE "+ (conditions.params || extras) : '',
				order: order ? " ORDER BY "+ order : order,
				group: group ? " GROUP BY "+ group : group,
				limit: limit ? " LIMIT "+ limit : limit,
				offset: offset ? " OFFSET "+ offset : offset
			}).trim(),
			values: [].concat(conditions.values||[])
		}
	}

	this.sanitizeConditions = function sanitizeConditions(conditions){
		var result = [];
		if (!(conditions instanceof Array)) conditions = [conditions];

		for (var i = 0; i < conditions.length; i++){

			// ["name = ?", "foo"]
			if (typeof(conditions[i]) == "string"  && i === 0){
				var args = conditions.slice(1);
				var params = conditions[0];

				if (typeof args[0] == 'object' && !(args[0] instanceof Array)){
					// ["name = :name", { name: "foo" }]
					var values = args[0];
					args = [];
					params = params.replace(/\:(\w+)/g, function(res, field){
						args.push(values[field]);
						return '?';
					});
				}

				return {
					params: params,
					values: args
				};
			}

			if (Object.prototype.toString.call(conditions[i]) == "[object Object]"){
				if (Object.keys(conditions[i]).length==0) return "";
				var conditions_values = [];

				for (var key in conditions[i]){
					// { name_is: "foo" }
					var query  = key.split('_');
					var attr   = ActiveSupport.Inflector.underscore(query[0]);
					var op     = query.slice(1).join('_');
					var values = conditions[i][key];

					var operator = '= ?';
					switch (op){
						case 'is': operator = 'IS ?'; break;
						case 'is_not': operator = 'IS NOT ?'; break;
						case 'like': operator = 'LIKE ?'; break;
						case 'not_like': operator = 'NOT LIKE ?'; break;
						case 'gt': operator = '> ?'; break;
						case 'gte': operator = '>= ?'; break;
						case 'lt': operator = '< ?'; break;
						case 'lte': operator = '<= ?'; break;
						case 'between': operator = 'BETWEEN (?) AND (?)'; break;
						case 'exists': operator = 'EXISTS (?)'; break;
						case 'not_exists': operator = 'NOT EXISTS (?)'; break;
						case 'some': operator = 'SOME (?)'; break;
						case 'all': operator = 'ALL (?)'; break;
						case 'in': operator = 'IN (?)'; break;
						case 'not_in': operator = 'NOT IN (?)'; break;
					}

					if (values instanceof Array && !op) operator = "IN (?)";
					if (!(values instanceof Array)) values = [values];

					for (var v in values){
						if (values[v] instanceof Date) attr = "DATE("+ attr + ")"; break;
					}

					var joiner = op == 'like' || op == 'between' ? ' OR ' : ' AND ';

					var sanitizeArray = function sanitizeArray(value){
						var arr = [];
						if (value instanceof Array){
							var values = [];
							arr.push([attr, operator].join(' '));
							for (var v in value){
								if (op && op != 'in' && op != "not_in"){
									values = values.concat(value[v]);
								} else {
									return [[ arr.join(' '), [value] ]];
								}
							}
							if (arr.length>0) arr = [arr.join(joiner), values];
						}
						return [arr];
					}

					result.push(sanitizeArray(values));
				}

				var getValues = function getValues(array){
					return array.map(function (arr, index){
						if (arr && arr[1] instanceof Array) return getValues(arr[1]);
						else return arr;
					})
				}

				for (var i=0; i<result.length; i++){
					conditions_values = conditions_values.concat(getValues(result[i]));
					result[i][0].splice(1, 1);
				}
			}
		}
		conditions_values = ActiveSupport.flatten(conditions_values, 1);
		result = result.join(' AND ');

		return {
			params: result,
			values: conditions_values
		};
	}

	this.make_insert = function ( options ){
		if( Object.prototype.toString.call(options)!="[object Object]" ) options = {};
		var sql = 'INSERT INTO :table (:attr) VALUES (:values)', from = options.from || '';
		return Query.format(sql, {
			table: from,
			attr: options.attr.join(', '),
			values: options.attr.map(function (opt) { return '?' })
		})
	}


	this.make_update = function ( options ){
		if( !options && typeof(options)!="object" ) options = {};
		if( Object.prototype.toString.call(options.params)!="[object Object]" ){
			var SQLFormat = new Exception.SQLFormat('Can\'t SET '+ options.params);
			console.error(SQLFormat.toString());
			throw SQLFormat;
		}
		var sql = 'UPDATE :table SET ? WHERE ?',
			from = options.from;

		return sql.replace(':table', from);
	}

	this.make_delete = function ( options ){
		options = options || {};
		var sql = 'DELETE FROM :table :conditions';
		var from = options.from ? options.from : '';
		var conditions = this.sanitizeConditions(options.conditions);

		return {
			sql: Query.format(sql, {
				table: from,
				conditions: conditions && conditions.params ? "WHERE "+ conditions.params : ''
			}),
			values: conditions.values || []
		}
	}
}

Query.format = function (query, values) {
  	if (!values) return query;
  	return query.replace(/\:(\w+)/g, function (txt, key) {
    	if (values.hasOwnProperty(key)) {
      		return values[key];
    	}
    	return txt;
  	});
};

Query.queryFormat = function(sql, values) {
  values = [].concat(values);

  return sql.replace(/\?/g, function(match) {
    if (!values.length) {
      return match;
    }
    return MySQLEscape(values.shift(), false);
  });
};


isObject = function isObject(object){
	return (typeof item === "object" && !Array.isArray(item) && item !== null);
}
