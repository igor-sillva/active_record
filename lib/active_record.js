var Action = require('./relations/actions')
	, ActiveSupport = require('./active_support')
	, Callback = require('./callbacks')
	, Finder = require('./relations/finders_methods')
	, Calculation = require('./relations/calculations')
	, Association = require('./associations/associations')
	, Validator = require('./validations/validations')
	, Helpers = require('./helpers')
	, Transaction = require('./transaction');

module.exports = ActiveRecord

function ActiveRecord (){}

ActiveRecord.ClassMethods = {
	TableConfigs: ActiveRecord,
	Transaction: Transaction,
	Action: Action,
	Callback: Callback,
	Finder: Finder,
	Calculation: Calculation,
	Association: Association,
};

ActiveRecord.InstanceMethods = {
	Validator: Validator,
	Helpers: Helpers
};
