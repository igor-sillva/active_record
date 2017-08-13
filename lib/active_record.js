var ActiveSupport = require('./active_support');

var ActiveRecord = {
	/* @property {Boolean} */
	log: false,
	/* @property {String} */
	primary_key_prefix_type: 'id',// or 'table_name' or 'table_name_with_underscore'
	/* @property {String} */
	table_name_prefix: '',
	/* @property {String} */
	table_name_suffix: '',
	/* @property {Boolean} */
	pluralize_table_names: true,
	/* @property {String} */
	default_timezone: 'local',
	/* @property {Boolean} */
	record_timestamps: true,
	/* @property {Boolean} */
	cache_query: true,
	/* @property {Number} */
	max_number_of_listeners: 100,
	/* @property {String} */
	default_models_path: './models'
}

module.exports = ActiveRecord;
