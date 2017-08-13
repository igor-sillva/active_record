var ActiveSupport = require('./active_support')
	, Exception = require('./error')
	, Query     = require('./relations/query')
	, escape    = require('mysql').escape
	, pgFormat  = require('pg-format');

module.exports = Transaction

function Transaction (){
	/**
	*	Execute SQL
	*	@param {Object|String} sql
	*	@param {Object|Array} params
	*	@param {Function} callback
	*/
	this.exec = function exec(sql, params, callback){
		var self = this, sql = sql || "";
		process.timeBegin = 0;
		process.timeEnd = 0;
		process.color = Math.round((Math.random() * 1) + 35);
		process.timestamp = new Date();

		if (!this.connection.connected()){
			ConnectionNotEstablished();
		}

		if(typeof(params)=="function"){
			callback = params;
			params   = [];
		}

		/* Cache */
		var object_cached = this.cache.search_by_query(Query.queryFormat(sql, params));
		if (object_cached){
			var data_cached = object_cached.response;
			console.info('\033[1;%smCACHE (%sms) \033[1;37m%s\n\33[0m', process.color, process.timeBegin, object_cached.query);
			return callback ? callback(null, data_cached) : data_cached;
		}

		// postgres hack
		if (this.connection.get('driver') == 'postgres'){
			var parameters = {};
			if (sql.match(/UPDATE/)){
				for (p in params[0]){ parameters[p] = "%L" };
				parameters = [].concat(parameters, params[1]);
				params = params[0];
			}	else { 
				for (p in params)
					parameters[p] = "%L";
				parameters = ActiveSupport.values(parameters); 
			}
			
			sql = Query.queryFormat(sql, parameters)
				.replace(/`/g, '')
				.replace(/'/g, '');
			
			sql = pgFormat.apply(pgFormat, 
				ActiveSupport.flatten([sql, ActiveSupport.values(params)]));
			
			params = [];
		}

		// Begin
		var tx = this.connection.conn.begin(function (){
			// Query
			tx.query(sql, params, function query_callback(error, data){
				//
				process.timeBegin = Math.round(((new Date - process.timestamp)/1000)*100) / 100;
				console.info('\033[1;%sm%s Load (%sms) \033[1;37m%s\33[0m',
					process.color, self.name, process.timeBegin, Query.queryFormat(sql, params))

				if (error) rollback(error);
				if (data) data = data.rows;

				/* Cache the response */
				self.cache.add(Query.queryFormat(sql, params), data);
				return callback ? callback(error, data) : data;
			})
		});

		var rollback = function rollback (error){
			var driver = self.connection.get('driver').toUpperCase();
			var errMessage = driver +': '+error.message;
			if ( error.code == 'ER_PARSE_ERROR' ){
				error = new Exception.StatementInvalid(errMessage);
			} else if ( error.code == 'ER_BAD_FIELD_ERROR' ){
				error = new Exception.SQLFormat(errMessage);
			} else {
				error = new Exception.ActiveRecordError(errMessage);
			}
			console.error(error.toString());
			tx.rollback();
			console.error('\033[1;%sm(%sms)\033[1;37m rollback transaction\n\33[0m', process.color, process.timeEnd);
		}

		return tx;
	}

}

var ConnectionNotEstablished = function ConnectionNotEstablished(){
	var ConnectionNotEstablished = new Exception.ConnectionNotEstablished();
	console.error(ConnectionNotEstablished.toString());
	throw ConnectionNotEstablished;
}
