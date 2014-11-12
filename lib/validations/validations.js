var Errors = require('./errors')
	, ActiveRecordError = require('../error')
	, inherits = require('util').inherits;

module.exports = Validator

function Validator () {
	var errors = require('./error_messages');
	var self = this;
	/*
	*	Contants
	*/
	var MINIMUM = 1,
		MAXIMUM = 255,
	 	REPLACE = /\%{(\w+)}/g;

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
	this.validates = function validates (item, methods, options){
		for (var key in methods){
			if (methods[key]){
				if (Object.prototype.toString.call(methods[key])!=="[object Object]") methods[key] = {};
				this['validate_'+ key +'_of'](item, methods[key]);
			}
		}
	}

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
	this.validates_with = function validates_with(callback, options){
		options = options || {};
		this.errors = new Errors;
		var _validates_with = function _validates_with (data){
			return callback ? callback(data) : function (){ return data };
		}
		_validates_on(options.on, _validates_with, this);
	}

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
	this.validate_presence_of = function validate_presence_of (item, options){
		options = options || {};
		this.errors = new Errors;
		var _validate_presence_of = function _validate_presence_of (data){
			var messages = options.message || [];
			var allow_blank = options.allow_blank || false;
			var allow_empty = options.allow_empty || false;

			data.valid = _unless_and_if_lambdas(data, item, messages, options);

			data.set(item, data[item].trim());
			if (!data[item] || 0 === data[item].length && !allow_empty){
				data.valid = false, messages.push(errors.messages.empty); // Can't be empty
			}
			if (/^\s*$/.test(data[item]) && !allow_blank){
				data.valid = false, messages.push(errors.messages.blank); // Cant't be blank
			}
			if (!/^\s*$/.test(data[item]) && allow_blank || allow_empty){
				data.valid = false, messages.push(errors.messages.present); // Must be blank
			}

			if(!data.valid) {
				for (var i=0; i<messages.length; i++){
					data.errors.add(item, messages[i]);
				}
			}
		};

		_validates_on(options.on, _validate_presence_of, this);
	}

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
	this.validate_uniqueness_of = function validate_uniqueness_of (item, options){
		options = options || {};
		var params = {}; params[item] = this[item];
		this.errors = new Errors;
		var _validate_uniqueness_of = function _validate_uniqueness_of (data){
			return this.constructor.exists(params, function (exist){
				if (exist===true){
					data.errors.add(item, errors.messages.uniqueness);
				}
			}.bind(this))
		}

		if (!this.new_record)
			_validates_on(options.on, _validate_uniqueness_of, this)
	}

	/**
	*	@param {String} item
	*	@param {Object} options
	*
	*	Example:
	*	validate_numericality_of('foo', {greater_than: 10, odd: true})
	*/
	this.validate_numericality_of = function validate_numericality_of (item, options){
		options = options || {};

		var greater_than = options.greater_than,
			greater_than_or_equal_to = options.greater_than_or_equal_to,
			equal_to = options.equal_to,
			less_than = options.less_than,
			less_than_or_equal_to = options.less_than_or_equal_to,
			odd = options.odd,
			even = options.even,
			only_integer = options.only_integer || true;

		this.errors = new Errors;

		var _validate_numericality_of = function _validate_numericality_of (data){
			var message = options.message || [];
			var number = only_integer ? parseInt(data[item], 10) : parseFloat(data[item], 10);

			/*
			*	If not a NUMBER return FALSE!
			*/
			if (isNaN(number)){
				message.push(errors.messages.not_a_number), data.valid = false;
				data.errors.add(item, message[0], data);
				return false;
			}

			data.valid = _unless_and_if_lambdas(data, item, message, options);

			if (only_integer && !number.toString().match(/^\d+$/)){
				message.push(errors.messages.not_a_integer), data.valid = false;
			}

			if (greater_than && !(number > greater_than)) message.push(errors.messages.greater_than.replace("%{count}", greater_than)), data.valid = false;
			if (greater_than_or_equal_to && !(number >= greater_than_or_equal_to)) message.push(errors.messages.greater_than_or_equal_to.replace("%{count}", greater_than_or_equal_to)), data.valid = false;
			if (equal_to && !(number == equal_to)) message.push(errors.messages.equal_to.replace("%{count}", equal_to)), data.valid = false;
			if (less_than && !(number < less_than)) message.push(errors.messages.less_than.replace("%{count}", less_than_or_equal_to)), data.valid = false;
			if (less_than_or_equal_to && !(number <= less_than_or_equal_to)) message.push(errors.messages.less_than_or_equal_to.replace("%{count}", less_than_or_equal_to)), data.valid = false;
			if (even && number % 2 == 0) message.push(errors.messages.even), data.valid = false;
			if (odd && number %2 != 0) message.push(errors.messages.odd), data.valid = false;

			if(data.valid===false){
				for (var i=0; i<message.length; i++){
					data.errors.add(item, message[i], data);
				}
				return false;
			}
		}

		_validates_on(options.on, _validate_numericality_of, this);
	}

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
	this.validate_length_of = function validate_length_of (item, options) {
		options = options || {};
		var min = options.minimum || MINIMUM, too_short = options.too_short,
			max = options.maximum || MAXIMUM, too_long = options.too_long;

		this.errors = new Errors;

		var _validate_length_of = function _validate_length_of (data){
			data[item] = data[item] ? data[item].toString() : '';
			var message = "", is = options.is;

			data.valid = _unless_and_if_lambdas(data, item, message, options);

			if (is && data[item].length != is){
				data.valid = false, message = errors.messages.equal_to.replace("%{count}", is);
			} else if (data[item].length < min){
				data.valid = false, message = (too_short || errors.messages.too_short).replace("%{count}", min);
			} else if (data[item].length > max) {
				data.valid = false, message = (too_long || errors.messages.too_long).replace("%{count}", max);
			}

			if (data.valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on(options.on, _validate_length_of, this);
	}

	/*
	*
	*/
	this.validate_format_of = function validate_format_of (item, options){
		options = options || {};
		this.errors = new Errors;

		var _validate_format_of = function _validate_format_of (data){
			var format = new RegExp(options.with||""), message = options.message || errors.messages.invalid;

			data.valid = _unless_and_if_lambdas(data, item, message, options);

			if( !format.test(data[item].toString())) data.valid = false;

			if (data.valid===false){
				data.errors.add(item, message);
			}
		}
		_validates_on(options.on, _validate_format_of, this);
	}

	/*
	*
	*/
	this.validate_exclusion_of = function validate_exclusion_of (item, options){
		options = options || {};
		this.errors = new Errors;

		var _validate_exclusion_of = function _validate_exclusion_of (data){
			var message = options.message || "", within = options.in;

			data.valid = _unless_and_if_lambdas(data, item, message, options);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data[item] == within[i]){
					data.valid = false;
					message = errors.messages.exclusion;
				}
			}

			if (data.valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on(options.on, _validate_exclusion_of, this);
	}

	/*
	*
	*/
	this.validate_inclusion_of = function validate_inclusion_of (item, options){
		options = options || {};
		this.errors = new Errors;

		var _validate_inclusion_of = function _validate_inclusion_of (data){
			var message = options.message || "", within = options.in;

			data.valid = _unless_and_if_lambdas(data, item, message, options);

			for (var i=0; i<within.length && Array.isArray(within);i++){
				if (data[item] != within[i]){
					data.valid = false, message = errors.messages.inclusion;
				}
			}

			if (data.valid===false){
				data.errors.add(item, message);
			}
		}

		_validates_on(options.on, _validate_inclusion_of, this);
	}

	/*
	*	Call this function after another validations
	*	@param {Object} options
	*
	*	Example:
	*	this.validate_presence_of('foo');
	*	<..>
	*	this.has_secure_password({on: "create", password_field: "pass"});
	*/
	this.has_secure_password = function has_secure_password (options){
		var crypto = require('crypto');
		options = options || {};
		var password_field = options.password_field ||  "password";
		this.errors = new Errors;

		var _has_secure_password = function _has_secure_password (data){
			var password = data[password_field];
			if (data.valid && password){
				var secure_password = crypto.createHash("md5").update(password.toString()).digest("hex");
				data[password_field] = secure_password;
				data.set(password_field, secure_password);
				return true;
			}
			return false;
		}
		options.on = ['create', 'update'];
		_validates_on(options.on, _has_secure_password, this);
	}

	/*
	*
	*/
	this.emit_response_callback = function emit_response_callback (){
		var _emit_response_callback = function _emit_response_callback (data){
			this.emit('response_callback', data);
		}
		this.on('before_create', _emit_response_callback);
		this.on('before_update', _emit_response_callback);
		this.on('before_destroy', _emit_response_callback);
	}

	/*
	*	@param {Function} callback
	*	Example:
	*	function User(){
	*		this.before_create(function (){
	*			console.log("Anarkhia!!!")
	*		})
	*	}
	*/
	var _cb = ['before_destroy', 'before_create', 'before_update',
	'after_destroy', 'after_create', 'after_update'].forEach(function (method){
		this[method] = function _callback (callback){
			this.on(method, callback);
		}
	}.bind(this))

	/*
	*	unless, if,
	*/
	var _unless_and_if_lambdas = function _unless_and_if_lambdas (object, item, message, options){
		var IF     = options['if'] || undefined, valid = true,
			UNLESS = options['unless'] || undefined;

		if (IF && IF(object) === true){
			object.errors.add(item, message || errors.messages.invalid, object);
			valid = false;
		} else if (UNLESS && !UNLESS(object) === true) {
			object.errors.add(item, message || errors.messages.invalid, object);
			object.valid = false;
		}
		return valid;
	}

	/*
	*
	*/
	var _validates_on = function _validates_on (events, callback, instance){
		if (events){
			events = Array.isArray(events) ? events : [events];
			for (var evt=0; evt<events.length; evt++){
				if (events[evt]!='destroy')
					instance.on('before_'.concat(events[evt]), callback)
			}
		} else {
			instance.on('before_create', callback);
			instance.on('before_update', callback);
			// instance.on('before_destroy', callback);
		}
	}

}
