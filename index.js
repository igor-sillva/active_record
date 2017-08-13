/* Base Module */
exports.Base = require('./lib/base');

/* Configure ActiveRecord */
exports.configure = function configure (key, value){
	var ActiveRecord = require('./lib/active_record');
	/* configure({ primary_key_prefix_type: 'table_name', ... }) */
	if (1 === arguments.length && Object.prototype.toString.call(arguments[0])=="[object Object]"){
		for (var key in arguments[0]){
			if (ActiveRecord.hasOwnProperty(key)){
				ActiveRecord[key] = arguments[0][key];
			}
		}
	}
	/* configure('primary_key_prefix_type', 'table_name') */
	if (ActiveRecord.hasOwnProperty(key)){
		ActiveRecord[key] = value;
	}
};

/* ActiveSupport Module */
exports.ActiveSupport = require('./lib/active_support');
