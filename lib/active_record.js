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
	Transaction: Transaction,
	Action: Action,
	Finder: Finder,
	Calculation: Calculation,
	Association: Association,
};

ActiveRecord.InstanceMethods = {
	Callback: Callback,
	Validator: Validator,
	Helpers: Helpers
}
