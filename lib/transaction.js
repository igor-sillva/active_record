var Error = require('./error')
	,	inherits = require('util').inherits

module.exports = Transaction

function Transaction (callback){

	if (callback) callback(this);

	var tx = process.ACTIVERECORD.CONNECTION.begin()
		,	timestamp = new Date()
		,	timeBegin = timeEnd = 0
		,	color = Math.round((Math.random() * (36 - 35)) + 35);

	var cache = process.ACTIVERECORD.CACHE;
	/**
	*	Execute SQL
	*	@param {Object|String} sql
	*	@param {Object|Array} params
	*	@param {Function} callback
	*/
	this.exec_query = function (sql, params, callback){
		var self = this;
		if(typeof(params)=="function"){
			callback = params;
			params   = {};
		}
		
		/*
		*	Cache
		*/
		for ( var i in cache ){
			if (cache[i]['query'] === sql){
				console.info('\033[1;'+ color +'mCACHE ('+ timeBegin +'ms) \033[1;37m'+ cache[i]['query'] +'\33[0m');
				return tx.commit(callback ? callback(cache[i]['response']) : cache[i]['response']);
			}
		}

		tx.query(sql, params, function(err, data){
			if(err)	throw err
			data = data.rows.length > 1 ? data.rows : data.rows[0]
			cache.push({query: sql, response: data});
			return tx.commit(callback ? callback(data) : data)
		})
		.on('packet', function(packet){
			timeBegin = Math.round(((new Date - timestamp))*100)/100;
			console.info('\033[1;'+ color +'mSQL ('+ timeBegin +'ms) \033[1;37m'+ packet.sql +'\33[0m');
		})
		.on('error', function(err){
			console.error('\033[1;35m('+ timeEnd +'ms) \033[1;37m rollback transaction\33[0m');
			if( err.code == 'ER_PARSE_ERROR' )
				return new Error.StatementInvalid(this).toString();
			else
				console.error('\033[31m'+ err.message +'\033[0m');
			return callback ? callback(false) : false;
		})
		.on('end', function(){
			timeEnd = Math.round(((new Date - timestamp))*100)/100;
			console.info('\033[1;'+ color +'m('+ timeEnd +'ms) \033[1;37m commit transaction\33[0m')
		})
	}		
}