var ActiveRecord        = require('./active_record')
	, ActiveSupport     = require('./active_support')
	, Action            = require('./relations/actions')
	, Connection        = require('./connection')
	, EventEmitter      = require('events').EventEmitter
	, QueryCache        = require('./query_cache')
	, Callback          = require('./callbacks')
	, Finder            = require('./relations/finders_methods')
	, Calculation       = require('./relations/calculations')
	, Association       = require('./associations/associations')
	, Validator         = require('./validations/validations')
	, AttributesMethods = require('./attributes_methods')
	, Transaction       = require('./transaction');

var humanize      = ActiveSupport.Inflector.humanize
	, pluralize   = ActiveSupport.Inflector.pluralize
	, underscore  = ActiveSupport.Inflector.underscore
	, foreign_key = ActiveSupport.Inflector.foreign_key;

var inherits = require('util').inherits;

module.exports = Base;
/*
*   Example:
*   var ActiveRecord = require('active_record');
*
*   module.exports = Model
*
*   ActiveRecord.Base.extend_to(Model)
*   function Model (){
		Model.initialize(this);
*       this.attributes(arguments[0]);
*   }
*
*/
function Base (){
	AttributesMethods.call(this);
	Validator.call(this);
	Callback.call(this);
}

/* Instance Methods */
Base.prototype =
ActiveSupport.extend({},
	Callback.prototype,
	Validator.prototype,
	AttributesMethods.prototype,
	{
		__proto__: EventEmitter.prototype,
	}
)

/* Class Methods */
Base.connection = new Connection;
ActiveSupport.extend(Base,
	{
		/* @property {String} */
		table_name_prefix: ActiveRecord.table_name_prefix,
		/* @property {String} */
		table_name_suffix: ActiveRecord.table_name_suffix,
		/* @property {String} */
		table_name: Base.name,
		/* @property {String} */
		primary_key: ActiveRecord.primary_key_prefix_type,
		/* @property {Boolean} */
		foreign_key: false,
		/* @return table_name_prefix + table_name */
		to_s: function to_s (){
			var prefix = this.table_name_prefix
			, suffix = this.table_name_suffix
			, name = prefix.trim().length > 0 ? humanize(this.table_name) : this.table_name;
			return underscore(prefix + name + humanize(suffix));
		},
		/* @return #<function.name> */
		toString: function toString (){
			return "#<"+ this.name +">";
		},
		/* Model settings */
		settings: {
			/* @property {Array} */
			fields: [],
			/* @property {Boolean} */
			record_timestamps: ActiveRecord.record_timestamps,
			/* @property {Array} */
			belongs_to: [],
			/* @property {Array} */
			has_one: [],
			/* @property {Array} */
			has_many: [],
			/* @property {Array} */
			has_many_and_belongs_to: []
		},
		/* Get settings Model */
		get: function get (setting){
			if (this.settings.hasOwnProperty(setting)){
				return this.settings[setting];
			}
		},
		/* Set settings */
		set: function set (key, value){
			this.settings[key] = value;
		},
		/* TODO */
		cache: ActiveRecord.cache_query ? new QueryCache : false,
	}, Action.call(Base), Finder.call(Base), Calculation.call(Base), Association.call(Base),
	Transaction.call(Base), Callback.call(Base)
)
/* Set primary_key field */
Base.get('fields').push(Base.primary_key);


/*
*   Extends Methods to Model
*   @param {Function} destination
*   @return {Function}
*/
Base.extend = function extend(destination, source){
	if (!source) return destination;
	// inherits(destination, source);

	/* ClassMethods */
	ActiveSupport.extend(destination, source, EventEmitter.prototype);
	/* Prepare your self */
	Object.defineProperty(destination, 'constructor', {
		value: source,
		enumerable: false,
		writable: true,
		configurable: true
	});
	switch (ActiveRecord.primary_key_prefix_type){
		case 'table_name': destination.table_name = pluralize(destination.name.toLowerCase())+'id'; break;
		case 'table_name_with_underscore': destination.table_name = foreign_key(underscore(destination.name.toLowerCase())); break;
		default: destination.table_name = 'id';	break;
	}
	if (ActiveRecord.pluralize_table_names) destination.table_name = pluralize(underscore(destination.name.toLowerCase()));
	else destination.table_name = destination.name.toLowerCase();
	/* Set max of listeners */
	if (Base.connection.conn)
		Base.connection.conn.setMaxListeners(ActiveRecord.max_number_of_listeners);

	/* InstanceMethods */
	destination.prototype = Object.create(source.prototype, {
		constructor: {
			value: destination,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
}


/*
*   @param {String|Object} config
*
*   Example:
*   Base.configure_connection({
*       driver: 'mysql',
*       ...
*   })
*   // For more examples see the `connection.js` documentation
*/
Base.configure_connection = function configure_connection(config){

	/* Configure */
	Base.connection.config(config);
	/* Timezone */
	if (!Base.connection.get('timezone'))
		Base.connection.set('timezone', ActiveRecord.default_timezone);

	/* Events */
	Base.connection.
	on('connect', function(data){
		console.info("\033[1;37mINFO \033[1;36mDatabase connected.\033[1;32m "+ new Date().toGMTString() +"\033[0m");
	})
	.on('disconnect', function(data){
		console.info("\033[1;37mINFO \033[1;33mDatabase disconnected.\033[1;32m "+ new Date().toGMTString() +"\033[0m")
	});

	return this;
}

/*
*   After configurated the connection, establish the connection...
*   Example:
*   Base.configure_connection(<configs>).establish_connection()
*/
Base.establish_connection = function establish_connection(callback){
	Base.connection.connect(callback);
	return this;
}

/*
*   Why comment this? It's obvious!
*/
Base.close_connection = function close_connection(){
	Base.connection.disconnect();
	return this;
}
