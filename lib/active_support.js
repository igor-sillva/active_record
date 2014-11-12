
var ActiveSupport = {
	extend: function extend(destination, source){
		for (var property in source){
			destination[property] = source[property];
		}
		return destination;
	},

	clone: function clone(object){
		return ActiveSupport.extend({}, object);
	},

	keys: function keys(object){
		var keys_array = [];
		for(var key_name in object){
			keys_array.push(key_name);
		}
		return keys_array;
	},

	values: function values(object){
		var values_array = [];
		for(var key_name in object){
			values_array.push(object[key_name]);
		}
		return values_array;
	},

	Inflector : {
		Inflections : {
			plural_rules: [
				[/(m)an$/gi, 					'$1en'],
				[/(pe)rson$/gi, 				'$1ople'],
				[/(child)$/gi, 					'$1ren'],
				[/^(ox)$/gi, 					'$1en'],
				[/(ax|test)is$/gi, 				'$1es'],
				[/(octop|vir)us$/gi, 			'$1i'],
				[/(alias|status)$/gi, 			'$1es'],
				[/(bu)s$/gi, 					'$1ses'],
				[/(buffal|tomat|potat)o$/gi, 	'$1oes'],
				[/([ti])um$/gi, 				'$1a'],
				[/sis$/gi, 						'ses'],
				[/(?:([^f])fe|([lr])f)$/gi, 	'$1$2ves'],
				[/(hive)$/gi, 					'$1s'],
				[/([^aeiouy]|qu)y$/gi, 			'$1ies'],
				[/(x|ch|ss|sh)$/gi, 			'$1es'],
				[/(matr|vert|ind)ix|ex$/gi, 	'$1ices'],
				[/([m|l])ouse$/gi, 				'$1ice'],
				[/(quiz)$/gi, 					'$1zes'],
				[/s$/gi, 						's'],
				[/$/gi, 						's']
			],

			singular_rules: [
				[/(m)en$/gi, 														'$1an'],
				[/(pe)ople$/gi, 													'$1rson'],
				[/(child)ren$/gi, 													'$1'],
				[/([ti])a$/gi, 														'$1um'],
				[/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/gi, '$1$2sis'],
				[/(hive)s$/gi, 														'$1'],
				[/(tive)s$/gi, 														'$1'],
				[/(curve)s$/gi, 													'$1'],
				[/([lr])ves$/gi, 													'$1f'],
				[/([^fo])ves$/gi, 													'$1fe'],
				[/([^aeiouy]|qu)ies$/gi, 											'$1y'],
				[/(s)eries$/gi, 													'$1eries'],
				[/(m)ovies$/gi, 													'$1ovie'],
				[/(x|ch|ss|sh)es$/gi, 												'$1'],
				[/([m|l])ice$/gi, 													'$1ouse'],
				[/(bus)es$/gi, 														'$1'],
				[/(o)es$/gi, 														'$1'],
				[/(shoe)s$/gi, 														'$1'],
				[/(cris|ax|test)es$/gi, 											'$1is'],
				[/(octop|vir)i$/gi, 												'$1us'],
				[/(alias|status)es$/gi, 											'$1'],
				[/^(ox)en/gi, 														'$1'],
				[/(vert|ind)ices$/gi, 												'$1ex'],
				[/(matr)ices$/gi, 													'$1ix'],
				[/(quiz)zes$/gi, 													'$1'],
				[/s$/gi, 															'']
			],

			uncountable_words: ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep', 'moose', 'deer', 'news'],

			non_titlecased_words: [ 'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of',
									'at', 'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in','over', 'with', 'for' ],

			// These are regular expressions used for converting between String formats
			id_suffix: /(_ids|_id)$/g,
			underbar: /_/g,
			space_or_underbar: /[\ _]/g,
			uppercase: /([A-Z])/g,
			underbar_prefix: /^_/,
		},

		lang: 'eng',

		apply_rules: function apply_rules (str, rules, skip, override) {
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
		},

		indexOf: function indexOf(array, item, fromIndex, compareFunc) {
			if (!fromIndex) {
			  fromIndex = -1;
			}
			var index = -1;
			for (var i = fromIndex; i < array.length; i++) {
			  if (array[i] === item || compareFunc && compareFunc(array[i], item)) {
				index = i;
				break;
			  }
			}
			return index;
		},

		pluralize: function pluralize(string, plural) {
			return ActiveSupport.Inflector.apply_rules(
				string,
				ActiveSupport.Inflector.Inflections.plural_rules,
				ActiveSupport.Inflector.Inflections.uncountable_words,
				plural
			);
		},

		singularize: function singularize(string, singular) {
			return ActiveSupport.Inflector.apply_rules(
				string,
				ActiveSupport.Inflector.Inflections.singular_rules,
				ActiveSupport.Inflector.Inflections.uncountable_words,
				singular
			);
		},

		camelize: function camilze(string, lowFirstLetter) {
			var str = string.toLowerCase();
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
		},

		underscore: function underscore(string) {
			var str = string;
			var str_path = str.split('::');
			for (var i = 0; i < str_path.length; i++) {
				str_path[i] = str_path[i].replace(ActiveSupport.Inflector.Inflections.uppercase, '_$1');
				str_path[i] = str_path[i].replace(ActiveSupport.Inflector.Inflections.uppercase.underbar_prefix, '');
			}
			str = str_path.join('/').toLowerCase();
			return str;
		},

		humanize: function humanize(string, lowFirstLetter) {
			var str = string.toLowerCase();
			str = str.replace(ActiveSupport.Inflector.Inflections.id_suffix, '');
			str = str.replace(ActiveSupport.Inflector.Inflections.underbar, ' ');
			if (!lowFirstLetter) {
				str = ActiveSupport.Inflector.capitalize(str);
			}
			return str;
		},

		capitalize: function capitalize(string) {
			var str = string.toLowerCase();
			str = str.substring(0, 1).toUpperCase() + str.substring(1);
			return str;
		},

		dasherize: function dasherize(string) {
			var str = string;
			str = str.replace(ActiveSupport.Inflector.Inflections.space_or_underbar, '-');
			return str;
		},

		titleize: function titleize(string) {
			var str = string.toLowerCase();
			str = str.replace(underbar, ' ');
			var str_arr = str.split(' ');
			for (var x = 0; x < str_arr.length; x++) {
				var d = str_arr[x].split('-');
				for (var i = 0; i < d.length; i++) {
					if (ActiveSupport.Inflector.Inflections.non_titlecased_words.indexOf(d[i].toLowerCase()) < 0) {
						d[i] = ActiveSupport.Inflector.capitalize(d[i]);
					}
				}
				str_arr[x] = d.join('-');
			}
			str = str_arr.join(' ');
			str = str.substring(0, 1).toUpperCase() + str.substring(1);
			return str;
		},

		demodulize: function demodulize(string) {
			var str = string;
			var str_arr = str.split('::');
			str = str_arr[str_arr.length - 1];
			return str;
		},

		tableize: function tableize(string) {
			var str = string;
			str = ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.underscore(str));
			return str;
		},

		classify: function classify(string) {
			var str = string;
			str = ActiveSupport.Inflector.singularize(ActiveSupport.Inflector.camelize(str));
			return str;
		},

		foreign_key: function foreign_key(string, dropIdUbar) {
			var str = string;
			str = ActiveSupport.Inflector.underscore(ActiveSupport.Inflector.demodulize(str)) + ((dropIdUbar) ? ('') : ('_')) + 'id';
			return str;
		},

		ordinalize: function ordinalize(string) {
			var str = string;
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
		}
	}
}

module.exports = ActiveSupport;
