var Base        = require('./base')
	, Exception = require('./error')
	, Query     = require('./relations/query');

module.exports = Transaction

function Transaction (){

	var timestamp = 0
		, timeBegin = 0
		, timeEnd   = 0;
	var color =  Math.round((Math.random() * 1) + 35);
	/**
	*	Execute SQL
	*	@param {Object|String} sql
	*	@param {Object|Array} params
	*	@param {Function} callback
	*/
	this.exec = function exec(sql, params, callback){
		var self = this, sql = sql || "";
		timestamp = new Date();

		if (!this.connection.connected()){
			var ConnectionNotEstablished = new Exception.ConnectionNotEstablished();
			console.error(ConnectionNotEstablished.toString());
			throw ConnectionNotEstablished;
		}
		var conn = this.connection.conn;

		if(typeof(params)=="function"){
			callback = params;
			params   = [];
		}

		return conn.begin(function _begin(err, tx){
			if (err) throw err;

			/* Cache */
			var object_cached = self.cache.search_by_query(Query.queryFormat(sql, params));
			if (object_cached){
				var data_cached = object_cached.response;
				console.info('\033[1;%smCACHE (%sms) \033[1;37m%s\33[0m', color, timeBegin, object_cached.query);
				return callback ? callback(null, data_cached) : data;
			}

			if (self.connection.get('driver') == 'postgres'){
				if (sql.match(/INSERT/)) params = params.map(function (p){ if (p instanceof Date) p = p.toJSON(); return "'"+ p +"'"; })
				sql = Query.queryFormat(sql, params);
				params = [];
			}

			var transaction = tx.query(sql, params, function query_callback(error, data){
				timeBegin = Math.round(new Date - timestamp);

				if (transaction.stmt || transaction.text)
					console.info('\033[1;%smSQL (%sms) \033[1;37m%s\33[0m',
						color, timeBegin, Query.queryFormat(transaction.stmt || transaction.text, params))

				if (error){
					return tx.rollback(function rollback_callback(){
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
						return callback ? callback(error, null) : error;
					});
				}

				data = data.rows;

				return tx.commit(function commit_callback(){
					/* Cache the response */
					self.cache.add(Query.queryFormat(sql, params), data);
					return callback ? callback(null, data) : data;
				});


			})
			.on('packet', function _on_packet(packet){
				console.info('\033[1;%smSQL (%sms) \033[1;37m%s\33[0m', color, timeBegin, packet.sql);
			})
			.on('end', function _on_end(){
				timeEnd = Math.round(new Date - timestamp);
				if (tx.state() == 'committed'){
					console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
				} else if (tx.state() == 'rolled back'){
					console.error('\033[1;%sm(%sms)\033[1;37m rollback transaction\33[0m', color, timeEnd);
				}
			})

		})

	}

}
