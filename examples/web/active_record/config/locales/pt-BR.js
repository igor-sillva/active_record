var ActiveSupport = require('../index').ActiveSupport;

ActiveSupport.Inflector.inflections('pt-BR', function (inflector){

	inflector.uncountable(['tórax', 'tênis', 'ônibus', 'lápis', 'fênix']);

	var plural_rules = [
			[/(z|r)$/i, 																					 '$1es'],
			[/$/,  																								 	  's'],
			[/(s)$/i,  																						 	 '$1'],
			[/^(paí)s$/i, 																			  '$1ses'],
			[/al$/i,  																						  'ais'],
			[/el$/i,  																						  'eis'],
			[/ol$/i,  																						  'ois'],
			[/ul$/i,  																						  'uis'],
			[/([^aeou])il$/i,  																		 '$1is'],
			[/m$/i,   																							 'ns'],
			[/^(japon|escoc|ingl|dinamarqu|fregu|portugu)ês$/i,  '$1eses'],
			[/^(|g)ás$/i,  																			 '$1ases'],
			[/ão$/i,  																							'ões'],
			[/^(irm|m)ão$/i,  																		'$1ãos'],
			[/^(alem|c|p)ão$/i,  																	'$1ães'],
			[/ao$/i,  																							'oes'],
			[/^(irm|m)ao$/i,  																		'$1aos'],
			[/^(alem|c|p)ao$/i,  																	'$1aes']
	].forEach(function (rules){
		inflector.plural(rules[0], rules[1]);
	});

	var singular_rules = [
		[/([^ê])s$/i, 																							'$1'],
		[/^(á|gá|paí)s$/i,                                         '$1s'],
		[/(r|z)es$/i, 																							'$1'],
		[/([^p])ais$/i, 																					'$1al'],
		[/eis$/i, 																									'el'],
		[/ois$/i, 																									'ol'],
		[/uis$/i, 																									'ul'],
		[/(r|t|f|v)is$/i, 																				'$1il'],
		[/ns$/i, 																										 'm'],
		[/sses$/i, 																								 'sse'],
		[/^(.*[^s]s)es$/i, 																					'$1'],
		[/ães$/i, 																									'ão'],
		[/aes$/i, 																									'ao'],
		[/ãos$/i, 																									'ão'],
		[/aos$/i, 																									'ao'],
		[/ões$/i, 																									'ão'],
		[/oes$/i, 																									'ao'],
		[/(japon|escoc|ingl|dinamarqu|fregu|portugu)eses$/i, 			'$1ês'],
		[/^(g|)ases$/i,  																					'$1ás']
	].forEach(function (rules){
		inflector.singular(rules[0], rules[1])
	});

});

module.exports = exports = ActiveSupport.Inflector;
