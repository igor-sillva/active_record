var Error = require('./error')
	, Query = require('./relations/query')
	, inherits = require('util').inherits;

module.exports = Transaction

var DEBUG=process.ACTIVERECORD.DEBUG || true;
if(!DEBUG){
	console.info = function(log){ log };
	console.log  = function(log){ log };
	console.error = function(log){ log };	
}

function Transaction (){

	if (process.ACTIVERECORD.CONNECTION === undefined){
		throw new Error.ConnectionNotEstablished().toString();
	}

	var conn  = process.ACTIVERECORD.CONNECTION
		, timestamp = timeBegin = timeEnd = 0;
	var color = Math.round((Math.random() * 1) + 35);	

	/**
	*	Execute SQL
	*	@param {Object|String} sql
	*	@param {Object|Array} params
	*	@param {Function} callback
	*/
	this.exec_query = function (sql, params, callback){
		timestamp = new Date();

		if(!sql && typeof(sql)!="string"){
			throw new Error.StatementInvalid("This SQL code is `null` or not a `string`").toString();
		}

		if(typeof(params)=="function"){
			callback = params;
			params   = {};
		}

		conn.begin(function(err, tx){
			/*
			*	Cache
			*/
			for ( var i in process.ACTIVERECORD.CACHE ){
				queryFormat = Query.queryFormat(sql, params);
				if (process.ACTIVERECORD.CACHE[i]['query'] === queryFormat){
					var data = process.ACTIVERECORD.CACHE[i]['response'][0];
					console.info('\033[1;%smCACHE (%sms) \033[1;37m%s\33[0m', color, timeBegin, queryFormat);
					return tx.commit(function (){
						timeEnd = Math.round(new Date - timestamp);
						console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
						return callback ? callback(data) : data;
					});
				}
			}

			return tx.query(sql, params, function(error, data){
				timeEnd = Math.round(new Date - timestamp);
				
				if(error){
					return tx.rollback(function(){
						console.error('\033[1;%sm (%sms)\033[1;37m rollback transaction\33[0m', color, timeEnd);
						error.type = "ActiveRecord";
						if( error.code == 'ER_PARSE_ERROR' )
							throw new Error.StatementInvalid(error.message).toString();
						throw new Error.ActiveRecordError().toString.call(error);
					});
				}
				
				data = data.rows;

				if (data.length > 0){
					for (d in data){
						Object.defineProperty(data[d], "saved", {
							value: true,
							writable: false,
							enumerable: false,
							configurable: false
						})
					}	
				}

				// Cache the response	
				process.ACTIVERECORD.CACHE.push({
					query: Query.queryFormat(sql, params), 
					response: data
				});

				return tx.commit(function(err){
					timeEnd = Math.round(new Date - timestamp);
					console.info('\033[1;%sm(%sms) \033[1;37m commit transaction\33[0m', color, timeEnd);
					// try {
					// 	return callback(data);
					// } catch (e){
					// 	return data;
					// }
					return callback ? callback(data) : data;
				});
				

			})
			.on('packet', function(packet){
				timeBegin = Math.round(new Date - timestamp);
				console.info('\033[1;%smSQL (%sms) \033[1;37m%s\33[0m', color, timeBegin, packet.sql);
			})
			.setMaxListeners(100000);
		})
	}	
	
}