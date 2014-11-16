var ValidatorException = require('./errors')
	, errors_messages = require('./error_messages')
	, ActiveRecordError = require('../error')
	, inherits = require('util').inherits;

module.exports = Validator

function Validator () {}

Validator.prototype = {

	/*
	*	Contants
	*/
	MINIMUM: 1,
	MAXIMUM: 255,
	REPLACE: /\%{(\w+)}/g,

	/*
	*	@param {string|Array} method
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validates('name', {'presence': true});
	*	validates('name', {
	*		presence: true,
	*		uniqueness: {on: 'create'}
	*	})
	*/
	validates: function validates (item, methods, options){
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
			return callback ? callback(data) : function (){ return data };
		}
		_validates_on.call(this, options.on, _validates_with);
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
			var messages = options.message || [];
			var allow_blank = options.allow_blank || false;
			var allow_empty = options.allow_empty || false;
			var valid = _unless_and_if_lambdas(data, item, messages, options);

			if (data[item]) data.set(item, data[item].trim());

			if (!data[item] || 0 === data[item].length && !allow_empty){
				valid = false, messages.push(errors_messages.empty); // Can't be empty
			}

			if (/^\s*$/.test(data[item]) && !allow_blank){
				valid = false, messages.push(errors_messages.blank); // Cant't be blank
			}

			if (!/^\s*$/.test(data[item]) && allow_blank || allow_empty){
				valid = false, messages.push(errors_messages.present); // Must be blank
			}

			if(!valid) {
				for (var i=0; i<messages.length; i++){
					data.errors.add(item, messages[i]);
				}
			}
		};

		_validates_on.call(this, options.on, _validate_presence_of);
	},

	/**
	*	IMPORTANT!
	*	IT IS SAFER THAT YOU DO A VALIDATION IN YOUR DATABASE
	*	TO PREVENT DUPLICATION OF DATA.
	*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_uniqueness_of('foo', {message: "My Message"})
	*
	*	Obs: Work fine if exists a delay of 40ms for Example:
	*	function Member (){
	*		this.attributes(arguments[0]);
	*		this.validate_uniqueness_of('name');
	*	}
	*
	*	var member = Member.create({name: 'foo'}); // 'foo' exists
	*	setTimeout(function (){
	*		console.log(member.errors.full_messages); return // "Name has already been taken"
	*	})
	*/
	validate_uniqueness_of: function validate_uniqueness_of (item, options){
		new ActiveRecordError.ActiveRecordError("IMPORTANT!\n"+
			"IT IS SAFER THAT YOU DO A VALIDATION IN YOUR DATABASE\n"+
			"TO PREVENT DUPLICATION OF DATA.").toString();
		options = options || {};
		var params = {}; params[item] = this[item];

		var _validate_uniqueness_of = function _validate_uniqueness_of (data){
			return this.constructor.exists(params, function (exist){
				if (exist===true){
					data.errors.add(item, errors_messages.uniqueness);
				}
			}.bind(this))
		}

		if (!this.new_record)
			_validates_on.call(this, options.on, _validate_uniqueness_of)
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
			var message = options.message || [];
			var number = only_integer ? parseInt(data[item], 10) : parseFloat(data[item], 10);

			/*
			*	If not a NUMBER return FALSE!
			*/
			if (isNaN(number)){
				message.push(errors_messages.not_a_number), valid = false;
				data.errors.add(item, message[0], data);
				return false;
			}

			var valid = _unless_and_if_lambdas(data, item, message, options);

			if (only_integer && !number.toString().match(/^\d+$/)){
				message.push(errors_messages.not_a_integer), valid = false;
			}

			if (greater_than && !(number > greater_than)) message.push(errors_messages.greater_than.replace("%{count}", greater_than)), valid = false;
			if (greater_than_or_equal_to && !(number >= greater_than_or_equal_to)) message.push(errors_messages.greater_than_or_equal_to.replace("%{count}", greater_than_or_equal_to)), valid = false;
			if (equal_to && !(number == equal_to)) message.push(errors_messages.equal_to.replace("%{count}", equal_to)), valid = false;
			if (less_than && !(number < less_than)) message.push(errors_messages.less_than.replace("%{count}", less_than_or_equal_to)), valid = false;
			if (less_than_or_equal_to && !(number <= less_than_or_equal_to)) message.push(errors_messages.less_than_or_equal_to.replace("%{count}", less_than_or_equal_to)), valid = false;
			if (even && number % 2 == 0) message.push(errors_messages.even), valid = false;
			if (odd && number %2 != 0) message.push(errors_messages.odd), valid = false;

			if(valid===false){
				for (var i=0; i<message.length; i++){
					data.errors.add(item, message[i], data);
				}
				return false;
			}
		}

		_validates_on.call(this, options.on, _validate_numericality_of);
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
		var min = options.minimum || this.MINIMUM, too_short = options.too_short,
			max = options.maximum || this.MAXIMUM, too_long = options.too_long;

		var _validate_length_of = function _validate_length_of (data){
			data[item] = data[item] ? data[item].toString() : '';
			var message = "", is = options.is;
			var valid = _unless_and_if_lambdas(data, item, message, options);

			if (is && data[item].length != is){
				valid = false, message = errors_messages.equal_to.replace("%{count}", is);
			} else if (data[item].length < min){
				valid = false, message = (too_short || errors_messages.too_short).replace("%{count}", min);
			} else if (data[item].length > max) {
				valid = false, message = (too_long || errors_messages.too_long).replace("%{count}", max);
			}

			if (valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on.call(this, options.on, _validate_length_of);
	},

	/*
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_format_of('email', {
	*		with: ^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$
	*	})
	*/
	validate_format_of: function validate_format_of (item, options){
		options = options || {};

		var _validate_format_of = function _validate_format_of (data){
			var format = new RegExp(options.with||""), message = options.message || errors_messages.invalid;
			var valid = _unless_and_if_lambdas(data, item, message, options);

			if( !format.test(data[item].toString())) valid = false;

			if (valid===false){
				data.errors.add(item, message);
			}
		}
		_validates_on.call(this, options.on, _validate_format_of);
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
			var message = options.message || "", within = options.in;
			var valid = _unless_and_if_lambdas(data, item, message, options);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data[item] == within[i]){
					valid = false;
					message = errors_messages.exclusion;
				}
			}

			if (valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on.call(this,options.on, _validate_exclusion_of);
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
			var message = options.message || "", within = options.in;
			var valid = _unless_and_if_lambdas(data, item, message, options);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data[item] != within[i]){
					valid = false, message = errors_messages.inclusion;
				}
			}

			if (valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on.call(this, options.on, _validate_inclusion_of);
	},

	/*
	*	Call this function after another validations
	*	@param {Object} options
	*
	*	Example:
	*	this.validate_presence_of('foo');
	*	<..>
	*	this.has_secure_password({on: "create", password_field: "pass"});
	*/
	has_secure_password: function has_secure_password (options){
		var crypto = require('crypto');
		options = options || {};
		var password_field = options.password_field ||  "password";

		var _has_secure_password = function _has_secure_password (data){
			var password = data[password_field];
			if (password){
				var secure_password = crypto.createHash("md5").update(password.toString()).digest("hex");
				data[password_field] = secure_password;
				data.set(password_field, secure_password);
				return true;
			}
			return false;
		}
		options.on = ['create', 'update'];
		_validates_on.call(this, options.on, _has_secure_password);
	},

	/*
	*
	*/
	emit_response_callback: function emit_response_callback (){
		var _emit_response_callback = function _emit_response_callback (data){
			this.emit('response_callback', data);
		}
		this.on('before_create', _emit_response_callback);
		this.on('before_update', _emit_response_callback);
		this.on('before_destroy', _emit_response_callback);
	},

}

/*
*	unless, if,
*/
var _unless_and_if_lambdas = function _unless_and_if_lambdas (object, item, message, options){
	var IF     = options['if'] || undefined, valid = true,
		UNLESS = options['unless'] || undefined;

	if (IF && IF(object) === true){
		object.errors.add(item, message || errors_messages.invalid, object);
		valid = false;
	} else if (UNLESS && !UNLESS(object) === true) {
		object.errors.add(item, message || errors_messages.invalid, object);
		object.valid = false;
	}
	return valid;
}

/*
*
*/
var _validates_on = function _validates_on (events, callback){
	if (events){
		events = Array.isArray(events) ? events : [events];
		for (var evt=0; evt<events.length; evt++){
			if (events[evt]!='destroy')
				this.on('before_'.concat(events[evt]), callback)
		}
	} else {
		this.on('before_create', callback);
		this.on('before_update', callback);
	}
}
