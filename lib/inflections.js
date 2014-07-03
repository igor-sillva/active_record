 function Inflection (){
 	var inflection = this;

 	this.lang = 'eng';

 	// This is a list of nouns that use the same form for both singular and plural.
  	// This list should remain entirely in lower case to correctly match Strings.
 	this.uncountable_words = ['equipment', 'information', 'rice', 'money',
    'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news'];
 	// This is a list of words that should not be capitalized for title case
 	this.non_titlecased_words = [ 'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but',
    'to', 'of', 'at', 'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in',
    'over', 'with', 'for' ];
 	// These rules translate from the singular form of a noun to its plural form.
 	this.plural_rules = [
	    [/(m)an$/gi, '$1en'],
	    [/(pe)rson$/gi, '$1ople'],
	    [/(child)$/gi, '$1ren'],
	    [/^(ox)$/gi, '$1en'],
	    [/(ax|test)is$/gi, '$1es'],
	    [/(octop|vir)us$/gi, '$1i'],
	    [/(alias|status)$/gi, '$1es'],
	    [/(bu)s$/gi, '$1ses'],
	    [/(buffal|tomat|potat)o$/gi, '$1oes'],
	    [/([ti])um$/gi, '$1a'],
	    [/sis$/gi, 'ses'],
	    [/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
	    [/(hive)$/gi, '$1s'],
	    [/([^aeiouy]|qu)y$/gi, '$1ies'],
	    [/(x|ch|ss|sh)$/gi, '$1es'],
	    [/(matr|vert|ind)ix|ex$/gi, '$1ices'],
	    [/([m|l])ouse$/gi, '$1ice'],
	    [/(quiz)$/gi, '$1zes'],
	    [/s$/gi, 's'],
	    [/$/gi, 's']
    ];
 	// These rules translate from the plural form of a noun to its singular form.
 	this.singular_rules = [
 		[/(m)en$/gi, '$1an'],
	    [/(pe)ople$/gi, '$1rson'],
	    [/(child)ren$/gi, '$1'],
	    [/([ti])a$/gi, '$1um'],
	    [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/gi, '$1$2sis'],
	    [/(hive)s$/gi, '$1'],
	    [/(tive)s$/gi, '$1'],
	    [/(curve)s$/gi, '$1'],
	    [/([lr])ves$/gi, '$1f'],
	    [/([^fo])ves$/gi, '$1fe'],
	    [/([^aeiouy]|qu)ies$/gi, '$1y'],
	    [/(s)eries$/gi, '$1eries'],
	    [/(m)ovies$/gi, '$1ovie'],
	    [/(x|ch|ss|sh)es$/gi, '$1'],
	    [/([m|l])ice$/gi, '$1ouse'],
	    [/(bus)es$/gi, '$1'],
	    [/(o)es$/gi, '$1'],
	    [/(shoe)s$/gi, '$1'],
	    [/(cris|ax|test)es$/gi, '$1is'],
	    [/(octop|vir)i$/gi, '$1us'],
	    [/(alias|status)es$/gi, '$1'],
	    [/^(ox)en/gi, '$1'],
	    [/(vert|ind)ices$/gi, '$1ex'],
	    [/(matr)ices$/gi, '$1ix'],
	    [/(quiz)zes$/gi, '$1'],
	    [/s$/gi, '']
 	];

 	// These are regular expressions used for converting between String formats
	id_suffix = /(_ids|_id)$/g,
	underbar = /_/g,
	space_or_underbar = /[\ _]/g,
	uppercase = /([A-Z])/g,
	underbar_prefix = /^_/;
	  
  	/*
	    This is a helper method that applies rules based replacement to a String
	    Signature:
	    apply_rules(str, rules, skip, override) == String
	    Arguments:
	    str - String - String to modify and return based on the passed rules
	    rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
	    skip - Array: [String] - Strings to skip if they match
	    override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
	    Returns:
	    String - passed String modified by passed rules
	    Examples:
	    apply_rules("cows", InflectionJs.inflection.singular_rules) === 'cow'
	  */
	function apply_rules (str, rules, skip, override) {
	    if (override) {
	      str = override;
	    } else {
	      var ignore = (skip.indexOf(str.toLowerCase()) > -1);
	      if (!ignore) {
	        for (var x = 0; x < rules.length; x++) {
	          if (str.match(rules[x][0])) {
	            str = str.replace(rules[x][0], rules[x][1]);
	            break;
	          }
	        }
	      }
	    }
	    return str;
	};

	/*
	 This lets us detect if an Array contains a given element
	 Signature:
	 Array.indexOf(item, fromIndex, compareFunc) == Integer
	 Arguments:
	 item - Object - object to locate in the Array
	 fromIndex - Integer (optional) - starts checking from this position in the Array
	 compareFunc - Function (optional) - function used to compare Array item vs passed item
	 Returns:
	 Integer - index position in the Array of the passed item
	 Examples:
	 ['hi','there'].indexOf("guys") === -1
	 ['hi','there'].indexOf("hi") === 0
	*/

	if (!Array.prototype.indexOf) {
	  Array.prototype.indexOf = function(item, fromIndex, compareFunc) {
	    if (!fromIndex) {
	      fromIndex = -1;
	    }
	    var index = -1;
	    for (var i = fromIndex; i < this.length; i++) {
	      if (this[i] === item || compareFunc && compareFunc(this[i], item)) {
	        index = i;
	        break;
	      }
	    }
	    return index;
	  };
	}


	/*
	  This function adds plurilization support to every String object
	  Signature:
	    String.pluralize(plural) == String
	  Arguments:
	    plural - String (optional) - overrides normal output with said String
	  Returns:
	    String - singular English language nouns are returned in plural form
	  Examples:
	    "person".pluralize() == "people"
	    "octopus".pluralize() == "octopi"
	    "Hat".pluralize() == "Hats"
	    "person".pluralize("guys") == "guys"
	*/
	if (!String.prototype.pluralize) {
	  String.prototype.pluralize = function(plural) {
	    return apply_rules(
	      this,
	      inflection.plural_rules,
	      inflection.uncountable_words,
	      plural
	    );
	  };
	}

	/*
	  This function adds singularization support to every String object
	  Signature:
	    String.singularize(singular) == String
	  Arguments:
	    singular - String (optional) - overrides normal output with said String
	  Returns:
	    String - plural English language nouns are returned in singular form
	  Examples:
	    "people".singularize() == "person"
	    "octopi".singularize() == "octopus"
	    "Hats".singularize() == "Hat"
	    "guys".singularize("person") == "person"
	*/
	if (!String.prototype.singularize) {
	  String.prototype.singularize = function(singular) {
	    return apply_rules(
	      this,
	      inflection.singular_rules,
	      inflection.uncountable_words,
	      singular
	    );
	  };
	}

	/*
	  This function adds camelization support to every String object
	  Signature:
	    String.camelize(lowFirstLetter) == String
	  Arguments:
	    lowFirstLetter - boolean (optional) - default is to capitalize the first
	    letter of the results... passing true will lowercase it
	  Returns:
	    String - lower case underscored words will be returned in camel case
	    additionally '/' is translated to '::'
	  Examples:
	    "message_properties".camelize() == "MessageProperties"
	    "message_properties".camelize(true) == "messageProperties"
	*/
	if (!String.prototype.camelize) {
	   String.prototype.camelize = function(lowFirstLetter) {
	    var str = this.toLowerCase();
	    var str_path = str.split('/');
	    for (var i = 0; i < str_path.length; i++) {
	      var str_arr = str_path[i].split('_');
	      var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
	      for (var x = initX; x < str_arr.length; x++) {
	        str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
	      }
	      str_path[i] = str_arr.join('');
	    }
	    str = str_path.join('::');
	    return str;
	  };
	}

	/*
	  This function adds underscore support to every String object
	  Signature:
	    String.underscore() == String
	  Arguments:
	    N/A
	  Returns:
	    String - camel cased words are returned as lower cased and underscored
	    additionally '::' is translated to '/'
	  Examples:
	    "MessageProperties".camelize() == "message_properties"
	    "messageProperties".underscore() == "message_properties"
	*/
	if (!String.prototype.underscore) {
	   String.prototype.underscore = function() {
	    var str = this;
	    var str_path = str.split('::');
	    for (var i = 0; i < str_path.length; i++) {
	      str_path[i] = str_path[i].replace(uppercase, '_$1');
	      str_path[i] = str_path[i].replace(underbar_prefix, '');
	    }
	    str = str_path.join('/').toLowerCase();
	    return str;
	  };
	}

	/*
	  This function adds humanize support to every String object
	  Signature:
	    String.humanize(lowFirstLetter) == String
	  Arguments:
	    lowFirstLetter - boolean (optional) - default is to capitalize the first
	    letter of the results... passing true will lowercase it
	  Returns:
	    String - lower case underscored words will be returned in humanized form
	  Examples:
	    "message_properties".humanize() == "Message properties"
	    "message_properties".humanize(true) == "message properties"
	*/
	if (!String.prototype.humanize) {
	  String.prototype.humanize = function(lowFirstLetter) {
	    var str = this.toLowerCase();
	    str = str.replace(id_suffix, '');
	    str = str.replace(underbar, ' ');
	    if (!lowFirstLetter) {
	      str = str.capitalize();
	    }
	    return str;
	  };
	}

	/*
	  This function adds capitalization support to every String object
	  Signature:
	    String.capitalize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - all characters will be lower case and the first will be upper
	  Examples:
	    "message_properties".capitalize() == "Message_properties"
	    "message properties".capitalize() == "Message properties"
	*/
	if (!String.prototype.capitalize) {
	  String.prototype.capitalize = function() {
	    var str = this.toLowerCase();
	    str = str.substring(0, 1).toUpperCase() + str.substring(1);
	    return str;
	  };
	}

	/*
	  This function adds dasherization support to every String object
	  Signature:
	    String.dasherize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - replaces all spaces or underbars with dashes
	  Examples:
	    "message_properties".capitalize() == "message-properties"
	    "Message Properties".capitalize() == "Message-Properties"
	*/
	if (!String.prototype.dasherize) {
	  String.prototype.dasherize = function() {
	    var str = this;
	    str = str.replace(space_or_underbar, '-');
	    return str;
	  };
	}

	/*
	  This function adds titleize support to every String object
	  Signature:
	    String.titleize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - capitalizes words as you would for a book title
	  Examples:
	    "message_properties".titleize() == "Message Properties"
	    "message properties to keep".titleize() == "Message Properties to Keep"
	*/
	if (!String.prototype.titleize) {
	  String.prototype.titleize = function() {
	    var str = this.toLowerCase();
	    str = str.replace(underbar, ' ');
	    var str_arr = str.split(' ');
	    for (var x = 0; x < str_arr.length; x++) {
	      var d = str_arr[x].split('-');
	      for (var i = 0; i < d.length; i++) {
	        if (inflection.non_titlecased_words.indexOf(d[i].toLowerCase()) < 0) {
	          d[i] = d[i].capitalize();
	        }
	      }
	      str_arr[x] = d.join('-');
	    }
	    str = str_arr.join(' ');
	    str = str.substring(0, 1).toUpperCase() + str.substring(1);
	    return str;
	  };
	}

	/*
	  This function adds demodulize support to every String object
	  Signature:
	    String.demodulize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - removes module names leaving only class names (Ruby style)
	  Examples:
	    "Message::Bus::Properties".demodulize() == "Properties"
	*/
	if (!String.prototype.demodulize) {
	  String.prototype.demodulize = function() {
	    var str = this;
	    var str_arr = str.split('::');
	    str = str_arr[str_arr.length - 1];
	    return str;
	  };
	}

	/*
	  This function adds tableize support to every String object
	  Signature:
	    String.tableize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - renders camel cased words into their underscored plural form
	  Examples:
	    "MessageBusProperty".tableize() == "message_bus_properties"
	*/
	if (!String.prototype.tableize) {
	  String.prototype.tableize = function() {
	    var str = this;
	    str = str.underscore().pluralize();
	    return str;
	  };
	}

	/*
	  This function adds classification support to every String object
	  Signature:
	    String.classify() == String
	  Arguments:
	    N/A
	  Returns:
	    String - underscored plural nouns become the camel cased singular form
	  Examples:
	    "message_bus_properties".classify() == "MessageBusProperty"
	*/
	if (!String.prototype.classify) {
	  String.prototype.classify = function() {
	    var str = this;
	    str = str.camelize().singularize();
	    return str;
	  };
	}

	/*
	  This function adds foreign key support to every String object
	  Signature:
	    String.foreign_key(dropIdUbar) == String
	  Arguments:
	    dropIdUbar - boolean (optional) - default is to seperate id with an
	    underbar at the end of the class name, you can pass true to skip it
	  Returns:
	    String - camel cased singular class names become underscored with id
	  Examples:
	    "MessageBusProperty".foreign_key() == "message_bus_property_id"
	    "MessageBusProperty".foreign_key(true) == "message_bus_propertyid"
	*/
	if (!String.prototype.foreign_key) {
	  String.prototype.foreign_key = function(dropIdUbar) {
	    var str = this;
	    str = str.demodulize().underscore() + ((dropIdUbar) ? ('') : ('_')) + 'id';
	    return str;
	  };
	}

	/*
	  This function adds ordinalize support to every String object
	  Signature:
	    String.ordinalize() == String
	  Arguments:
	    N/A
	  Returns:
	    String - renders all found numbers their sequence like "22nd"
	  Examples:
	    "the 1 pitch".ordinalize() == "the 1st pitch"
	*/
	if (!String.prototype.ordinalize) {
	  String.prototype.ordinalize = function() {
	    var str = this;
	    var str_arr = str.split(' ');
	    for (var x = 0; x < str_arr.length; x++) {
	      var i = parseInt(str_arr[x]);
	      if (i === NaN) {
	        var ltd = str_arr[x].substring(str_arr[x].length - 2);
	        var ld = str_arr[x].substring(str_arr[x].length - 1);
	        var suf = "th";
	        if (ltd != "11" && ltd != "12" && ltd != "13") {
	          if (ld === "1") {
	            suf = "st";
	          } else if (ld === "2") {
	            suf = "nd";
	          } else if (ld === "3") {
	            suf = "rd";
	          }
	        }
	        str_arr[x] += suf;
	      }
	    }
	    str = str_arr.join(' ');
	    return str;
	  };
	}

}

module.exports = new Inflection;