var Base        = require('./base')
	, Exception = require('./error')
	, Query     = require('./relations/query');

module.exports = Transaction

function Transaction (){

	var conn        = null
		, timestamp = 0
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
		var self = this;
		sql = sql || "";
		conn = this.connection.conn;

		if (!conn){
			var ConnectionNotEstablished = new Exception.ConnectionNotEstablished();
			console.error(ConnectionNotEstablished.toString());
			throw ConnectionNotEstablished;
		}

		if(typeof(params)=="function"){
			callback = params;
			params   = {};
		}

		return conn.begin(function _begin(err, tx){
			timestamp = new Date();
			if (err) throw err;

			/*
			*	Cache
			*/
			var object_cached = self.cache.search_by_query(Query.queryFormat(sql, params));
			if (object_cached){
				var data_cached = object_cached.response;
				console.info('\033[1;%smCACHE (%sms) \033[1;37m%s\33[0m', color, timeBegin, object_cached.query);
				return tx.commit(function commit(err, data){
					timeEnd = Math.round(new Date - timestamp);
					console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
					return callback ? callback(null, data_cached) : data;
				});
			}

			return tx.query(sql, params, function _query(error, data){
				timeEnd = Math.round(new Date - timestamp);

				if(error){
					return tx.rollback(function _rollback(){
						console.error('\033[1;%sm (%sms)\033[1;37m rollback transaction\33[0m', color, timeEnd);
						error.type = "ActiveRecord";
						if ( error.code == 'ER_PARSE_ERROR' ){
							error = new Exception.StatementInvalid(error.message);
						} else if ( error.code == 'ER_BAD_FIELD_ERROR' ){
							error = new Exception.SQLFormat(error.message);
						} else {
							error = new Exception.ActiveRecordError(error.message);
						}
						console.error(error.toString());
						return callback ? callback(error, null) : error;
					});
				}

				data = data.rows;

				return tx.commit(function _commit(){
					/* Cache the response */
					self.cache.add(Query.queryFormat(sql, params), data);
					timeEnd = Math.round(new Date - timestamp);
					console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
					return callback ? callback(null, data) : data;
				});


			})
			.on('packet', function _on_packet(packet){
				timeBegin = Math.round(new Date - timestamp);
				console.info('\033[1;%smSQL (%sms) \033[1;37m%s\33[0m', color, timeBegin, packet.sql);
			})

		})

	}

}
