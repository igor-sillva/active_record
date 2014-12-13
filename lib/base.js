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

Base.prototype =
ActiveSupport.extend({},
	Callback.prototype,
	Validator.prototype,
	AttributesMethods.prototype,
	{
		__proto__: EventEmitter.prototype,
	}
)

ActiveSupport.extend(Base,
	Action.call(Base),
	Finder.call(Base),
	Calculation.call(Base),
	Association.call(Base),
	Transaction.call(Base),
	Callback.call(Base)
)

Base.connection = new Connection;

/*
*   Extends Methods to Model
*   @param {Function} destination
*   @return {Function}
*/
/* HOLY SHIT */
Base.extend = function extend(destination, source){
	source = source || this;

	var primary_key_prefix_type;
	switch (ActiveRecord.primary_key_prefix_type){
		case 'table_name':
			primary_key_prefix_type = pluralize(destination.name.toLowerCase())+'id';
			break;
		case 'table_name_with_underscore':
			primary_key_prefix_type = foreign_key(underscore(destination.name.toLowerCase()));
			break;
		default:
			primary_key_prefix_type = 'id';
			break;
	}

	var table_name = destination.name.toLowerCase();
	if (ActiveRecord.pluralize_table_names)
		table_name = pluralize(underscore(table_name));
	/* ClassMethods */
	ActiveSupport.extend(destination, {
		/* @property {String} */
		table_name_prefix: ActiveRecord.table_name_prefix,
		/* @property {String} */
		table_name_suffix: ActiveRecord.table_name_suffix,
		/* @property {String} */
		table_name: table_name,
		/* @property {String} */
		primary_key: primary_key_prefix_type,
		/* @property {Boolean} */
		foreign_key: false,
		/* @return table_name_prefix + table_name */
		to_s: function to_s (){
			var prefix = this.table_name_prefix
			, suffix = this.table_name_suffix
			, name = prefix.trim().length > 0 ? humanize(this.table_name) : this.table_name;
			return underscore(prefix+name+humanize(suffix));
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
			has_many_to_many: []
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
			return this;
		},
		/* TODO */
		cache: ActiveRecord.cache_query ? new QueryCache : false,
	}, source, EventEmitter.prototype);

	/* Set primary_key field */
	destination.get('fields').push(destination.primary_key);
	/* Set max of listeners */
	if (destination.connection.conn)
		destination.connection.conn.setMaxListeners(ActiveRecord.max_number_of_listeners);

	/* InstanceMethods */
	destination.prototype = Object.create(source.prototype, {
		constructor: {
			value: destination,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	Object.defineProperty(destination, 'constructor', {
		value: source,
		enumerable: false,
		writable: true,
		configurable: true
	})

	return destination;
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
Base.configure_connection = function (config){

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
Base.establish_connection = function (){
	Base.connection.connect();
	return this;
}

/*
*   Why comment this? It's obvious!
*/
Base.close_connection = function (){
	Base.connection.disconnect();
	return this;
}
