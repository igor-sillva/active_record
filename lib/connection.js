var EventEmitter = require('events').EventEmitter
	, fs = require('fs')
	, path = require('path')
	, inherits = require('util').inherits
	, anyDB = null
	, Exception = require('./error');

try{
	anyDB = require('any-db');
} catch (e){
	throw new Exception("anyDB failed to load, please `npm install any-db`")
	return
}

/*
*	Exports Connection
*/
module.exports = Connection

inherits(Connection, EventEmitter)
/**
* @param {Object|String} settings
*
* Example:
* new Connection({
*   driver: 'mysql',
*   user: 'root',
*   password: '',
*   port: 3306,
*   hostname: 'localhost',
*   database: 'database_name',
*   pool: true
* })
*
*	or
*
* new Connection('path/to/file.json')
*	JSON file example:
*	{
*	  "dev": {
*	    "driver": "mysql",
*	    "hostname": "localhost",
*	    "port": "3306",
*	    "user": "root",
*	    "password": "",
*	    "database": "chat"
*	  },
*
*	  "test": {
*	    "driver": "sqlite3",
*	    "filename": "./database"
*	  },
*
*	  "prod": {
*	    "driver": "pg",
*	    "user": "test",
*	    "password": "test",
*	    "host": "localhost",
*	    "database": "mydb"
*	  }
*	}
*/
function Connection (settings){
	EventEmitter.call(this);
	this.settings = {};
	this.conn     = null;

	// Default configs
	this.set('env', process.env.NODE_ENV || 'dev');
	this.set('pool config', { min: 1, max: 20 });

	if( settings )
		this.config(settings);
}

/**
* @param {Object|String} settings
*/
Connection.prototype.config = function (settings){
	settings = settings || {};

	if( typeof(settings) == 'string' ){
		try {
			if( fs.statSync(settings) ){
				try {
					settings = require(settings)[this.get('env')]
				} catch (e){
					settings = require(path.join(process.cwd(), settings))[this.get('env')];
				}
			}
		} catch (e){
			// TODO
		}
	}

	for(var setting in settings)
		this.set(setting, settings[setting])

	switch (this.get('driver')){
		case 'mysql': /* driver://user:password@hostname/database */
		case 'postgres':
			var url = this.get('driver')+'://'+this.get('user')+':'+this.get('password')+'@'+this.get('hostname')+'/'+this.get('database')
			this.set('dbURL', url);
			break;
		case 'sqlite3': /* sqlite3://filename */
			this.set('dbURL', 'sqlite3://'+this.get('filename'))
			break
		default:
			var DriverNotFound = new Exception.DriverNotFound(this.get('driver'));
			console.error(DriverNotFound.toString());
			throw DriverNotFound;
	}

	return this;

}

/**
* Establish connection with Database
* @param {Function} callback
*/
Connection.prototype.connect = function (callback){
	var self = this
	switch(this.get('driver')){
		case 'postgres':
			anyDB.adapters.postgres.forceJS = true
		case 'mysql':
		case 'sqlite3':
			if(this.get('pool')===true){
				this.conn = anyDB.createPool(this.get('dbURL'), {
					min: self.get('pool config').min,
					max: self.get('pool config').max,
					onConnect: function (conn, done){
						done(null, conn);
						return callback ? callback(conn) : self.emit('connect', conn);
					},
					reset: function (conn, done){
						done(null)
					}
				})
				.on('error', function(err){
					var ConnectionNotEstablished = new Exception.ConnectionNotEstablished(err);
					console.error(ConnectionNotEstablished.toString());
					throw ConnectionNotEstablished;
				})
			} else {
				this.conn = anyDB.createConnection(this.get('dbURL'), function(err, data){
					if(err){
						var ConnectionNotEstablished = new Exception.ConnectionNotEstablished(err);
						console.error(ConnectionNotEstablished.toString());
						throw ConnectionNotEstablished;
					}
					return callback ? callback(data) : self.emit('connect', data)
				})
			}
			break;
	}
	return this;

}

Connection.prototype.connected = function (){
	return this.conn ? true : false;
}

Connection.prototype.disconnect = function(callback){
	if(this.conn){
		if(this.get('pool')===true)
			this.conn.close();
		else
			this.conn.end();
		this.conn = null;
		this.emit('disconnect', this);
		callback ? callback.call(this) : function cb() {};
		return this;
	}
	var ConnectionNotEstablished = new Exception.ConnectionNotEstablished();
	console.error(ConnectionNotEstablished.toString());
	throw ConnectionNotEstablished();
}

Connection.prototype.reconnect = function(callback){
	if(this.conn){
		this.emit('reconnect', this);
		this.disconnect();
		this.connect();
		callback ? callback.call(this) : function cb() {};
	}
}

Connection.prototype.set = function (setting, val){
	if (1 == arguments.length) {
		if (this.settings.hasOwnProperty(setting)) {
			return this.settings[setting];
		} else if (this.parent) {
			return this.parent.set(setting);
		}
	} else {
		this.settings[setting] = val;
		return this;
	}
}

Connection.prototype.get = Connection.prototype.set
