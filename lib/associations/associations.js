	var ActiveRecord = require('../active_record')
	, ActiveSupport  = require('../active_support')
	, Query          = require('../relations/query')
	, Exception      = require('../error')
	, path           = require('path');

module.exports = Association

function Association (){

	/**
	*   	                              |       |          | has_many
	*	generated methods                 | habtm | has_many | :through
	*	----------------------------------+-------+----------+----------
	*	others                            |   X   |    X     |    X
	*	others=(other,other,...)          |   X   |    X     |    X
	*	other_ids                         |   X   |    X     |    X
	*	other_ids=(id,id,...)             |   X   |    X     |    X
	*	others<<                          |   X   |    X     |    X
	*	others.push                       |   X   |    X     |    X
	*	others.concat                     |   X   |    X     |    X
	*	others.build(attributes={})       |   X   |    X     |    X
	*	others.create(attributes={})      |   X   |    X     |    X
	*	others.create!(attributes={})     |   X   |    X     |    X
	*	others.size                       |   X   |    X     |    X
	*	others.length                     |   X   |    X     |    X
	*	others.count                      |   X   |    X     |    X
	*	others.sum(*args)                 |   X   |    X     |    X
	*	others.empty?                     |   X   |    X     |    X
	*	others.clear                      |   X   |    X     |    X
	*	others.delete(other,other,...)    |   X   |    X     |    X
	*	others.delete_all                 |   X   |    X     |    X
	*	others.destroy(other,other,...)   |   X   |    X     |    X
	*	others.destroy_all                |   X   |    X     |    X
	*	others.find(*args)                |   X   |    X     |    X
	*	others.exists?                    |   X   |    X     |    X
	*	others.distinct                   |   X   |    X     |    X
	*	others.uniq                       |   X   |    X     |    X
	*	others.reset                      |   X   |    X     |    X
	*   -----------------------------------------------------------------
	*   ------------------------------------------------------------------------
	*	                                  |            |  belongs_to  |
	*	generated methods                 | belongs_to | :polymorphic | has_one
	*	----------------------------------+------------+--------------+---------
	*	other                             |     X      |      X       |    X
	*	other=(other)                     |     X      |      X       |    X
	*	build_other(attributes={})        |     X      |              |    X
	*	create_other(attributes={})       |     X      |              |    X
	*	create_other!(attributes={})      |     X      |              |    X
	*
	* 	http://api.rubyonrails.org/classes/ActiveRecord/Associations/ClassMethods.html
	*/

	/**
	*	@param {String} association
	*	@param {Object} options
	*
	*	Example:
	*	belongs_to("bar", {
	*		class_name: 'Foo',
	*		foreign_key: 'foo_id',
	*		dependent: "destroy" or "delete",
	*		finder_sql: "YOUR SQL QUERY",
	*		conditions: ["foo > ?"],
	*		params : ['bar']
	*	})
	*/
	this.belongs_to = function belongs_to (association, options) {
		var self        = this;
		var options     = options || {}
		var foreign_key = ActiveSupport.Inflector.foreign_key(options.foreign_key || this.foreign_key || association);  // Default ForeignKey = <model>_id
		var primary_key = this.primary_key;
		var dependent   = options.dependent || false;
		var finder_sql  = options.finder_sql || false;
		var class_name  = options.class_name || false;
		var has_one     = options.has_one || false;

		association = ActiveSupport.Inflector.singularize(association).toString();

		var Klass = Association.check_if_model_exists.call(this, class_name || association);

		if (has_one){
			this.get('has_one').push(Klass);
			Klass.foreign_key = ActiveSupport.Inflector.foreign_key(ActiveSupport.Inflector.singularize(this.table_name));
		} else this.get('belongs_to').push(Klass);

		this.on('before_destroy', function _destroy_dependents(record){
			if (dependent){
				record.once('before_destroy', function _destroy_dependents(record){
					if (!record.errors.any){
						if (has_one && dependent == 'nullify'){
							var conditions = [Klass.foreign_key +" = "+ record.get(self.primary_key)];
							var params = {}; params[foreign_key] = null;
							Klass.update_all(conditions, params);
						} else if (dependent != 'nullify'){
							if (!record.get(self.foreign_key)) return Klass[dependent+"_all"]();
							Klass[dependent+"_all"]([Klass.table_name + "." + Klass.primary_key.concat(" = ?"), record.get(self.foreign_key)]);
						}
					}
				})
			}
		})

		this.prototype[association] = function _belongs_to_association(callback){
			var record     = this;
			var conditions = options.conditions || [];
			var params     = options.params || [];

			params.push(has_one ? this.get(self.primary_key) : this.get(foreign_key));
			conditions.push([has_one ? Klass.foreign_key.concat(" = ?") : Klass.primary_key.concat(" = ?")]);
			conditions = conditions.join(' AND ');

			if (has_one) Klass.prototype._foreign_key_id = this.get(this.constructor.primary_key);

			if (!this.get(self.primary_key) || !(has_one ? true : this.get(self.foreign_key)) ){
				var RecordNotFound = new Exception.RecordNotFound("Couldn't find '"+ Klass.table_name +"' without an ID");
				console.error(RecordNotFound.toString());
				return callback ? callback(RecordNotFound, null) : RecordNotFound;
			}

			var query = finder_sql ? finder_sql :
				new Query().make_select({
					from: Klass ? Klass.to_s() : association.pluralize(),
					foreign_key: foreign_key,
					primary_key: primary_key,
					limit: has_one ? '1' : undefined,
					conditions: conditions
				})

			params = params.concat(query.values);
			var transaction = Klass.find_by_sql(query.sql ? query.sql : query, params, callback);
			Klass = ActiveSupport.extend(function (){}, Klass);
			Klass._extra_parameters = [Klass.table_name + "." + Klass.foreign_key +" = "+ record.get(record.constructor.primary_key)];
			return Klass;
		}
	}

	/**
	*	@param {String} association
	*	@param {Object} options
	*
	*	Example:
	*	has_one("foo", {
	*		foreign_key: 'foo_id',
	*		dependent: "destroy" or "delete" or "nullify",
	*		finder_sql: "YOUR SQL QUERY",
	*		conditions: ["foo > ?"],
	*		params : ['bar']
	*	})
	*/
	this.has_one = function has_one(association, options){
		options = options || {};
		options.has_one = true;
		return this.belongs_to(association, options);
	}

	/**
	*	@param {String} association
	*	@param {Object} options
	*
	*	Example:
	*	has_many("foo", {
	*		foreign_key: 'foo_id',
	*		dependent: "destroy" or "delete" or "nullify",
	*		finder_sql: "YOUR SQL QUERY",
	*		conditions: ["foo > ?"],
	*		params : ['bar']
	*	})
	*/
	this.has_many = function has_many (association, options) {
		var self        = this;
		var options     = options  || {};
		var foreign_key = ActiveSupport.Inflector.foreign_key(options.foreign_key || this.foreign_key || ActiveSupport.Inflector.singularize(this.table_name));
		var dependent   = options.dependent || false;
		var finder_sql  = options.finder_sql || false;
		var class_name = options.class_name || false;

		association = ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.singularize(association));

		var Klass = Association.check_if_model_exists.call(this, class_name || ActiveSupport.Inflector.singularize(association));
		Klass.foreign_key = foreign_key;

		this.get('has_many').push(Klass);

		this.on('before_destroy', function _destroy_dependents(record){
			if (dependent){
				record.once('before_destroy', function _destroy_dependents(record){
					if (!record.errors.any){
						if (dependent=='nullify'){
							var conditions = [Klass.foreign_key +" = "+ record.get(self.primary_key)];
							var params = {}; params[foreign_key] = null;
							Klass.update_all(conditions, params);
						} else {
							if (!record.get(self.primary_key)) return Klass[dependent+"_all"]();
							Klass[dependent+"_all"]([Klass.table_name + "." + Klass.foreign_key.concat(" = ?"), record.get(self.primary_key)]);
						}
					}
				})
			}
		});

		/*
		*	@param {Function} callback
		*	@return Klass
		*
		*	Example:
		*	User.has_many('phones')
		*	User.find(1, function(u){
		*		user = u[0];
		*		user.phones(function (phones, Phone){
		*			phones.forEach(function (phone){
		*				phone.destroy()
		*			})
		*
		*			Phone.all(function (phones){
		*				console.log(phones)
		*			})
		*		})
		*	})
		*/
		this.prototype[association] = function _has_many_association(callback){
			var record    = this;
			var conditions  = options.conditions || [];
			var params      = options.params || [];

			Klass.prototype._foreign_key_id = this.get(this.constructor.primary_key);

			params.push(this[self.primary_key]);

			if (!this[self.primary_key]){
				var RecordNotFound = new Exception.RecordNotFound("Couldn't find '"+ Klass.table_name +"' without an ID");
				console.error(RecordNotFound.toString());
				return callback ? callback(RecordNotFound, null) : RecordNotFound;
			}

			conditions.push([foreign_key.concat(" = ?")]);
			conditions = conditions.join(' AND ');
			var query = finder_sql ? finder_sql :
				new Query().make_select({
					from: Klass ? Klass.to_s() : association,
					conditions: conditions
				})

			params = params.concat(query.values);
			var transaction = Klass.find_by_sql(query.sql ? query.sql : query, params, callback);
			// Klass = ActiveSupport.extend(function (){}, Klass);
			Klass._extra_parameters = [Klass.table_name + "." + Klass.foreign_key +" = "+ record.get(record.constructor.primary_key)]
			return Klass;
		}
	}

	/**
	*	@param {String} association
	*	@param {Object} options
	*
	*	Example:
	*	has_many("foo", {
	*		foreign_key: 'foo_id',
	*		association_foreign_key: 'bar_id',
	*		class_name: "FooBar",
	*		join_table: "foo_bar",
	*		conditions: ["foo > ?"],
	*		params : ['bar']
	*	})
	*/
	this.has_many_and_belongs_to = function has_many_and_belongs_to(association, options) {
		association = ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.singularize(association));

		var self        = this;
		var options     = options  || {};
		//
		var foreign_key = ActiveSupport.Inflector.foreign_key(
												options.foreign_key ||
												ActiveSupport.Inflector.singularize(this.table_name));
		//
		var association_foreign_key = ActiveSupport.Inflector.foreign_key(
												options.association_foreign_key ||
												ActiveSupport.Inflector.singularize(association));
		//
		var class_name = options.class_name || false;
		//
		var join_table  = options.join_table || this.to_s() +"_"+ association;
		//
		var AssociationClass         = Association.check_if_model_exists.call(this,
																		class_name ||
																		options.association_foreign_key ||
																		ActiveSupport.Inflector.singularize(association));
		//
		var HasManyAndBelongsToClass = Association.check_if_model_exists.call(this,
																		ActiveSupport.Inflector.camelize(class_name || join_table));

		HasManyAndBelongsToClass.table_name = join_table;

		this.get('has_many_and_belongs_to').push(AssociationClass);
		/*
		*	@param {Function} callback
		*	@return AssociationClass
		*
		*	Example:
		*	User.has_many_and_belongs_to('phones')
		*	User.find(1, function(u){
		*		user = u[0];
		*		user.phones(function (phones, Phone){
		*			phones.forEach(function (phone){
		*				phone.destroy()
		*			})
		*
		*			Phone.all(function (phones){
		*				console.log(phones)
		*			})
		*		})
		*	})
		*/
		this.prototype[association] = function _has_many_and_belongs_to(callback){
			var record      = this;
			var conditions  = options.conditions || [];
			var params      = options.params || [];

			AssociationClass.after_create(function (response, association_foreign_data){
				var object = {};
				object[foreign_key] = record.get(self.primary_key);
				object[association_foreign_key] = association_foreign_data.get(AssociationClass.primary_key);
				HasManyAndBelongsToClass.create(object);
			})

			params.push(this[self.primary_key]);

			if (!this[self.primary_key]){
				var RecordNotFound = new Exception.RecordNotFound("Couldn't find '"+ AssociationClass.table_name +"' without an ID");
				console.error(RecordNotFound.toString());
				return callback ? callback(RecordNotFound, null) : RecordNotFound;
			}

			conditions.push([(join_table+"."+foreign_key).concat(" = ?")]);
			conditions = conditions.join(' AND ');
			var query = new Query().make_select({
					from: AssociationClass ? AssociationClass.to_s() : association,
					join: join_table,
					primary_key: AssociationClass.primary_key,
					foreign_key: association_foreign_key,
					conditions: conditions
				})

			params = params.concat(query.values);

			var transaction = AssociationClass.find_by_sql(query.sql ? query.sql : query, params, callback);
			return AssociationClass;
		}
	}

}

/*
*	@param {String} association
*	@return ModelKlass
*/
Association.check_if_model_exists = function check_if_model_exists (association){
	if (process.mainModule){
		var moduleExports = process.mainModule.exports[ActiveSupport.Inflector.humanize(association)];
		if (moduleExports) return moduleExports;
	}

	var Klass = null;
	var path_to_models = path.join(process.cwd(), ActiveRecord.default_models_path);

	try {
		/* Try require the module in default_path_models */
		Klass = require(path.join(path_to_models, ActiveSupport.Inflector.singularize(association)));
	} catch (error){
		/* Try again require the module in the parent path */
		try {
			Klass = require(path.join(path_to_models, '..', ActiveSupport.Inflector.singularize(association)));
		} catch (error){
			var Base = require('../base');
			Klass = eval("Klass = function "+ association +"(attributes){ this.initialize(attributes); }");
			Base.extend(Klass, Base);
		}

	}

	return Klass;
}
