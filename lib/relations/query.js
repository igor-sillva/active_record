var Exception = require('../error'),
	ActiveSupport = require('../active_support');

module.exports = Query

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
	this.make_select = function ( options ){
		if( !options && !typeof(options)=="object" )
			return '';

		var sql = 'SELECT :select FROM :table:include:conditions:order:group:limit:offset',
			from = options.from ? options.from : '',
			select = options.select ? options.select : '*',
			include = '', conditions = '',
			order = options.order ? ' ORDER BY '+ (options.order.toString().match(/ASC|DESC/) ? options.order : options.order +' ASC') : '',
			group = options.group ? ' GROUP BY '+ options.group : '',
			limit = options.limit ? ' LIMIT '+ options.limit : '',
			offset = options.offset ? ' OFFSET '+ options.offset : '';
			primary_key = from +"."+ options.primary_key || 'id';
			foreign_key = options.foreign_key || ActiveSupport.Inflector.singularize(from) +'_id';
			or = options.or || null;
			and = options.and || null;

		//
		or = or ? " OR "+ or : '';
		and = and ? " AND "+ and : '';

		if( options.conditions ){
			var opt  = options.conditions
				, where = (opt.where||opt._where) || opt;

			/*
			*	Operator: OR|AND
			*/
			operator = opt.operator || "AND" ;
			if(Array.isArray(where)){
				where = where.join(" "+ operator +" ");
			}

			conditions =
				opt['is'] ? ' WHERE '+ where +' = '+ opt['is'] :
				opt['not null'] || opt['notNull'] ? ' WHERE '+ where +' IS NOT NULL' :
				opt['not'] ? ' WHERE '+ where +' IS NOT (\''+ opt['not'] +'\')' :
				opt.any ? ' WHERE '+ where + ' ANY ('+ opt.any +')' :
				opt.in  ? ' WHERE '+ where + ' IN ('+ (opt.in.sort().map(function(o){return o})) +')'   :
				opt['not in'] || opt['notIn'] ? ' WHERE '+ where + ' NOT IN ('+ (opt['not in'] || opt['notIn']) +')' :
				opt['some_'] ? ' WHERE '+ where + ' SOME ('+ opt['some_'] +')' :
				opt.all  ? ' WHERE '+ where + ' ALL ('+ opt.all +')' :
				opt.like ? ' WHERE '+ where + ' LIKE ('+ opt.like +')' :
				opt.exists ? ' WHERE EXISTS ('+ opt.exists +')' :
				opt['not exists'] || opt['notExists'] ? ' WHERE NOT EXISTS ('+ opt['not exists'] +')' :
				' WHERE '+ (Array.isArray(where) ? where.join(' '+ operator +' ') : where);
			//
			conditions = [conditions];
			conditions.push(or);
			conditions.push(and);
			conditions = conditions.join('');

		} else if ( Array.isArray(options) ){
			conditions = ' WHERE '+ options.join(' AND ');
		}

		/**
		* Make join Query
		*/
		if( options.include || options.join || options._join ){
			var inc = options.include || options.join || options.j;
				direction = inc.direction ? inc.direction : 'INNER';
				join = inc.join ? inc.join : inc;
				on = inc.on ? inc.on : inc +'.'+ foreign_key +' = '+ primary_key;
				include = ' '+ direction +' JOIN '+ join +' ON '+ on;
		}
		return sql.replace(':select', select)
		  		  .replace(':table', from)
				  .replace(':include', include)
				  .replace(':conditions', conditions)
				  .replace(':order', order)
				  .replace(':group', group)
				  .replace(':limit', limit)
				  .replace(':offset', offset);
	}

	this.make_insert = function ( options ){
		if( !options && typeof(options)!="object" )
			return '';
		var sql = 'INSERT INTO :table SET ?',
			from = options.from ? options.from : '';
			// attr = options.attr ? options.attr : Object.keys(options.params);
		return sql.replace(':table', from);
				  // .replace(':attr', attr)
				  // .replace(':values', values);
	}


	this.make_update = function ( options ){
		if( !options && typeof(options)!="object" )
			return '';
		if( !options.params && typeof(options.params)!="object" )
			throw new Exception.SQLFormat('Can\'t SET '+ options.params).toString();

		var sql = 'UPDATE :table SET :params:conditions',
			from = options.from,
			conditions, params = '';
			if (options.params) {
				if (Array.isArray(options.params)) {
					params = options.params.map(function(p){
				 		p[1] = "?";
				 		return p.join(' = ');
				 	}).join(' , ');
				} else {
					var params_array = [];
					for (key in options.params){
						params_array.push([key, "?"].join(' = '))
					}
					params_array.join(' , ');
					params += params_array;
				}
			} else {
				params = ''
			}

			conditions = ' WHERE ';
			if (options.conditions){
				if (Array.isArray(options.conditions)) {
					conditions += options.conditions.map(function(c){
						c[1] = "'"+ c[1].toString() +"'";
						return c.join(' = ');
					}).join(' AND ');
				} else {
					var conditions_array = [];
					for (key in options.conditions){
						conditions_array.push([key, options.conditions[key]].join(' = '))
					}
					conditions_array.join(' AND ');
					conditions += conditions_array;
				}
			} else {
				conditions += 'id = ?';
			}

		return sql.replace(':table', from)
				  .replace(':params', params)
				  .replace(':conditions', conditions);
	}

	this.make_delete = function ( options ){
		if( !options && typeof(options)!="object" )
			options = {};
		var sql = 'DELETE FROM :table:conditions',
			from = options.from ? options.from : '',
			conditions = '';
		if( options.conditions ){
			var opt  = options.conditions,
				where = opt.where || opt;
			conditions = opt.any ? ' WHERE '+ where + ' ANY ('+ opt.any +')' :
						 opt.in  ? ' WHERE '+ where + ' IN ('+ opt.in +')'   :
						 opt['not in'] ? ' WHERE '+ where + ' NOT IN ('+ opt['not in'] +')' :
						 opt.some_ ? ' WHERE '+ where + ' SOME ('+ opt.some_ +')' :
						 opt.all  ? ' WHERE '+ where + ' ALL ('+ opt.all +')' :
						 opt.exists ? ' WHERE EXISTS ('+ opt.exists +')' :
						 opt['not exists'] ? ' WHERE NOT EXISTS ('+ opt['not exists'] +')' :
						 ' WHERE '+ (Array.isArray(where) ? where.join(' AND ') : where);
		}
		return sql.replace(':table', from)
				  .replace(':conditions', conditions);
	}
}

Query.format = function (query, values) {
  	if (!values) return query;
  	return query.replace(/\:(\w+)/g, function (txt, key) {
    	if (values.hasOwnProperty(key)) {
      		return this.escape(values[key]);
    	}
    	return txt;
  	});
};

Query.queryFormat = function(sql, values, timeZone) {
  values = [].concat(values);

  return sql.replace(/\?/g, function(match) {
    if (!values.length) {
      return match;
    }
    return values.shift();
  });
};
