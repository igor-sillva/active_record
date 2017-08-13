var ValidatorException  = require('./errors')
	, errors_messages   = require('./error_messages')
	, ActiveRecord      = require('../active_record')
	, ActiveRecordError = require('../error');

module.exports = Validator

function Validator () {}

Validator.prototype = {
	/*
	*	@param {string|Array} method
	*	@param {String} item
	*
	*	Example:
	*	validates('name', {'presence': true});
	*	validates('name', {
	*		presence: true,
	*		uniqueness: {on: 'create'}
	*	})
	*/
	validates: function validates (item, methods){
		for (var key in methods){
			if (methods[key]){
				if (Object.prototype.toString.call(methods[key])!=="[object Object]") methods[key] = {};
				this['validate_'+ key +'_of'](item, methods[key]);
			}
		}
	},

	/*
	*	@param {Function} callback
	*	@param {Object} options
	*	Example:
	*	validates_with(my_validation);
	*
	*	var my_validation = function my_validation (record){
	*		if (record.name=="root") record.errors.add('name', 'is a reserverd');
	*	}
	*
	*/
	validates_with: function validates_with(callback, options){
		options = options || {};

		var _validates_with = function _validates_with (data){
			return callback ? callback.apply(this, data) : function (){ return data };
		}
		Validator.bind.call(this, options.on, _validates_with);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_presence_of('foo', {
	*		unless: function (data){
	*			return data.bar == 'baz';
	*		}
	*	})
	*	validate_presence_of('foo', {message: 'My message'})
	*/
	validate_presence_of: function validate_presence_of (item, options){
		options = options || {};

		var _validate_presence_of = function _validate_presence_of (data){
			var message = options.message;
			var allow_blank = options.allow_blank || false;
			var allow_empty = options.allow_empty || false;


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message || errors_messages.invalid);

			if (!data.get(item) || (0 === data.get(item).length && !allow_empty) ){
				data.errors.add(item, errors_messages.empty); // Can't be empty
			}

			if (data.get(item)){
				if (!allow_blank) data.set(item, data.get(item).toString().trim());
				if (/^\s*$/.test(data.get(item)) && !allow_blank){
					data.errors.add(item, errors_messages.blank); // Cant't be blank
				}
				if (!/^\s*$/.test(data.get(item)) && allow_blank || allow_empty){
					data.errors.add(item, errors_messages.present); // Must be blank
				}
			}

		};

		Validator.bind.call(this, options.on, _validate_presence_of);
	},

	/**
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_uniqueness_of('foo', {message: "My Message"})
	*
	*	function Member (){
	*		this.attributes(arguments[0]);
	*		this.validate_uniqueness_of('name');
	*	}
	*/
	validate_uniqueness_of: function validate_uniqueness_of (item, options){
		options = options || {};
		var self = this.constructor;

		var _validate_uniqueness_of = function _validate_uniqueness_of (data){
			var params = {}
				, message = options.message;
			params[item] = data.get(item);

			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message || errors_messages.invalid);

			var exists = this.constructor.exists(params, function _validate_uniqueness_of_exists (error, exist){
				if (exist===true){
					data.errors.add(item, errors_messages.uniqueness);
				}
			})
		}

		Validator.bind.call(this, options.on, _validate_uniqueness_of);
	},

	/**
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_numericality_of('foo', {greater_than: 10, odd: true})
	*/
	validate_numericality_of: function validate_numericality_of (item, options){
		options = options || {};

		var greater_than = options.greater_than,
			greater_than_or_equal_to = options.greater_than_or_equal_to,
			equal_to = options.equal_to,
			less_than = options.less_than,
			less_than_or_equal_to = options.less_than_or_equal_to,
			odd = options.odd,
			even = options.even,
			only_integer = options.only_integer || true;

		var _validate_numericality_of = function _validate_numericality_of (data){
			var message = options.message || errors_messages.invalid;
			var number = only_integer ? parseInt(data.get(item), 10) : parseFloat(data.get(item), 10);

			/*
			*	If not a NUMBER return FALSE!
			*/
			if (isNaN(number))
				return data.errors.add(item, errors_messages.not_a_number);


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message);

			if (only_integer && !number.toString().match(/^\d+$/))
				data.errors.add(item, errors_messages.not_a_integer);

			if (greater_than && !(number > greater_than))
				data.errors.add(item, errors_messages.greater_than.replace("%{count}", greater_than));
			if (greater_than_or_equal_to && !(number >= greater_than_or_equal_to))
				data.errors.add(item, errors_messages.greater_than_or_equal_to.replace("%{count}", greater_than_or_equal_to));
			if (equal_to && !(number == equal_to))
				data.errors.add(item, errors_messages.equal_to.replace("%{count}", equal_to));
			if (less_than && !(number < less_than))
				data.errors.add(item, errors_messages.less_than.replace("%{count}", less_than_or_equal_to));
			if (less_than_or_equal_to && !(number <= less_than_or_equal_to))
				data.errors.add(item, errors_messages.less_than_or_equal_to.replace("%{count}", less_than_or_equal_to));
			if (even && number % 2 == 0)
				data.errors.add(item, errors_messages.even);
			if (odd && number %2 != 0)
				data.errors.add(item, errors_messages.odd);

		}

		Validator.bind.call(this, options.on, _validate_numericality_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_length_of('foo', { is: 10 })
	*	validate_length_of('foo',
	*		{
	*			maximum: 300,
	*			minimum: 400,
	*			too_short: "must have at least %{count} words",
	*			too_long: "must have at most %{count} words",
	*			on: "create"
	*		})
	*/
	validate_length_of: function validate_length_of (item, options) {
		options = options || {};
		var min = options.minimum || 1, too_short = options.too_short, equal_to = options.equal_to,
				max = options.maximum || 255, too_long = options.too_long;

		var _validate_length_of = function _validate_length_of (data){
			var message = options.message || errors_messages.invalid;
			var is = options.is;


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message);

			if (is && data.get(item).length != is){
				data.errors.add(item, equal_to || errors_messages.equal_to.replace("%{count}", is));
			} else if (data.get(item).length < min){
				data.errors.add(item, (too_short || errors_messages.too_short).replace("%{count}", min));
			} else if (data.get(item).length > max) {
				data.errors.add(item, (too_long || errors_messages.too_long).replace("%{count}", max));
			}

		}

		Validator.bind.call(this, options.on, _validate_length_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_format_of('email', {
	*		with: "^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$"
	*	})
	*/
	validate_format_of: function validate_format_of (item, options){
		options = options || {};

		var _validate_format_of = function _validate_format_of (data){
			var format = new RegExp(options.with), message = options.message || errors_messages.invalid;


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message);

			if (format.test(data.get(item))) data.errors.add(item, message);
		}

		Validator.bind.call(this, options.on, _validate_format_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_exclusion_of('name', {
	*		in: ['root', 'admin']
	*	})
	*/
	validate_exclusion_of: function validate_exclusion_of (item, options){
		options = options || {};

		var _validate_exclusion_of = function _validate_exclusion_of (data){
			var message = options.message || undefined, within = options.in;


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message || errors_messages.invalid);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data.get(item) == within[i]){
					data.errors.add(item, message || errors_messages.exclusion);
					break;
				}
			}

		}

		Validator.bind.call(this,options.on, _validate_exclusion_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_inclusion_of('name', {
	*		in: ['foo', 'bar']
	*	})
	*/
	validate_inclusion_of: function validate_inclusion_of (item, options){
		options = options || {};

		var _validate_inclusion_of = function _validate_inclusion_of (data){
			var message = options.message, within = options.in;


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, message || errors_messages.invalid);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data.get(item) != within[i]){
					data.errors.add(item, message || errors_messages.inclusion);
					break;
				}
			}

		}

		Validator.bind.call(this, options.on, _validate_inclusion_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_confirmation_of('name')
	*/
	validate_confirmation_of: function validate_confirmation_of (item, options){
		options = options || {};
		options.message;
		options.on          = options.on || ['create', 'update'];
		options.validations = options.validations == false ? false : true;

		var confirmation_field = item +"_confirmation";
		/* Validate presence first */
		if (options.validations===true)
			this.validate_presence_of(confirmation_field);

		Validator.bind.call(this, options.on, function _validate_confirmation_of (data){


			var proc_validator = Validator.proc_validator(data, options);
			if (proc_validator === true) return;
			else if (proc_validator === false) data.errors.add(item, options.message || errors_messages.invalid);

			if ( !(data[confirmation_field]===data.get(item)) ){
				data.errors.add(item, options.message || errors_messages.confirmation);
			} else { /* delete field from _object */
				delete data._object[confirmation_field];
				delete data[confirmation_field];
				delete data.changes[confirmation_field];
			}
		})
	},

	/*
	*	Call this function after another validations
	*	@param {Object} options
	*
	*	Example:
	*	this.validate_presence_of('foo');
	*	<..>
	*	this.has_secure_password({password_field: "pass"});
	*/
	has_secure_password: function has_secure_password (options){
		var crypto = require('crypto');
		options = options || {};
		options.password_field = options.password_field || "password";
		options.validations    = options.validations == false ? false : true;

		var password_field = options.password_field;

		if (options.validations){
			this.validate_confirmation_of(password_field); /* Validate confirmation */
		}

		try {
			this.password_digest = this.get(password_field);
		} catch (error){
			this.password_digest = undefined;
		}
		/*
		* @param {String} unencrypted_password
		* Example:
		* user.password("akrata");
		* user.save();
		* user.authenticate('akrata'); // @return user
		*/
		this.authenticate = function authenticate(unencrypted_password){
			return this.password_digest === encrypt(unencrypted_password) && this;
		}

		/* Listener */
		var _has_secure_password = function _has_secure_password (data){
			var password = data[password_field];
			if (password){
				data.password_digest = encrypt(password);
				data.set(password_field, data.password_digest)
				return true;
			}
		}

		options.on = ['create', 'update'];
		Validator.bind.call(this, options.on, _has_secure_password);

		// Private
		var encrypt = function encrypt(password){
			return crypto
			.createHash('sha1')
			.update(password)
			.digest('hex');
		}
	},

	/*
	*	Emit all Events before the transaction
	*/
	emit_response_callback: function emit_response_callback (action_name){
		var _emit_response_callback = function _emit_response_callback (data){
			this.emit('response_callback', data);
		}
		this.once('before_'+ action_name, _emit_response_callback);
	}

}

/*
*	@param {String} item
*	@param {String} message
*	@param {Object} options
*
*	Example:
*	Validator.proc_validator('name', '', { if: proc() })
*/
Validator.proc_validator = function proc_validator (object, options){
	var IF     = options['if'],
		UNLESS = options['unless'] || options['if not'];

	if (IF || UNLESS){
		if (IF && IF.call(object, object) === true) return false;
		else if (UNLESS && !(UNLESS.call(object, object)) === true) return false;
		return true;
	}
}

/*
*	@param {Array} events
*	@param {Function} callback
*
*	Example:
*	Validator.bind('create', callback());
*/
Validator.bind = function bind (events, callback){
	if (events){
		events = Array.isArray(events) ? events : [events];
		for (var evt=0; evt<events.length; evt++){
			if (events[evt]!=="destroy") this.once('before_'+ events[evt], callback.bind(this));
		}
	} else {
		this.once('before_create', callback.bind(this));
		this.once('before_update', callback.bind(this));
	}
}
