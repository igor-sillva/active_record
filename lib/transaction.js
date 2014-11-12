var Base        = require('./base')
	, Exception = require('./error')
	, Query     = require('./relations/query')
	, inherits  = require('util').inherits;

module.exports = Transaction

function Transaction (){

	var conn  = null
		, timestamp = timeBegin = timeEnd = 0;
	var color = Math.round((Math.random() * 1) + 35);

	/**
	*	Execute SQL
	*	@param {Object|String} sql
	*	@param {Object|Array} params
	*	@param {Function} callback
	*/
	this.exec_query = function (sql, params, callback){
		var self = this;
		conn = this.connection.conn;
		if (!conn) throw new Exception.ConnectionNotEstablished().toString();

		timestamp = new Date();

		if(!sql && typeof(sql)!="string"){
			return "";
		}

		if(typeof(params)=="function"){
			callback = params;
			params   = {};
		}


		return conn.begin(function(err, tx){
			if (err) console.log(err);
			/*
			*	Cache
			*/
			// var cache = process.ActiveRecord.Cache;
			// for ( var c in cache ){
			// 	queryFormat = Query.queryFormat(sql, params);
			// 	if (cache[c]['query'] === queryFormat){
			// 		var data = cache[c]['response'];
			// 		console.info('\033[1;%smCACHE (%sms) \033[1;37m%s\33[0m', color, timeBegin, queryFormat);
			// 		return tx.commit(function (){
			// 			timeEnd = Math.round(new Date - timestamp);
			// 			console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
			// 			return callback ? callback(data) : data;
			// 		});
			// 	}
			// }

			return tx.query(sql, params, function(error, data){
				timeEnd = Math.round(new Date - timestamp);

				if(error){
					return tx.rollback(function(){
						console.error('\033[1;%sm (%sms)\033[1;37m rollback transaction\33[0m', color, timeEnd);
						error.type = "ActiveRecord";
						if( error.code == 'ER_PARSE_ERROR' )
							throw new Exception.StatementInvalid(error.message).toString();
						throw new Exception.SQLFormat().toString.call(error);
					});
				}

				data = data.rows;

				if (data.length > 0){
					for (d in data){
						Object.defineProperty(data[d], "new_record", {
							value: false,
							writable: false,
							enumerable: false,
							configurable: false
						})
					}
				}
				// Cache the response
				// console.log(this)
				// cache.push({
				// 	query: Query.queryFormat(sql, params),
				// 	response: data
				// });

				return tx.commit(function(err){
					timeEnd = Math.round(new Date - timestamp);
					console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
					this.emit('data', data);
					return callback ? callback(data) : data;
				}.bind(tx));

			})
			.on('packet', function(packet){
				timeBegin = Math.round(new Date - timestamp);
				console.info('\033[1;%smSQL (%sms) \033[1;37m%s\33[0m', color, timeBegin, packet.sql);
			})
			.setMaxListeners(100000); // Don't tell me why

		})

	}

}
