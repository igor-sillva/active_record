var ActiveSupport = require('../active_support')
	, Base = require('../base')
	, util = require('util')
	, Query = require('../relations/query')
	, Exception = require('../error')
	, path = require('path');

module.exports = Association

function Association (){

	this.associations = [];
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
	*	belongs("bar", {
	*		foreign_key: 'foo_id',
	*		dependent: "destroy" or "delete",
	*		finder_sql: "YOUR SQL QUERY",
	*		conditions: ["foo > ?"],
	*		params : ['bar']
	*	})
	*/
	this.belongs_to = function belongs_to (association, options) {
		var self = this;
		var options = options || {}
		var foreign_key = ActiveSupport.Inflector.foreign_key(options.foreign_key || this.foreign_key || association);  // Default ForeignKey = <model>_id
		var dependent = options.dependent || false;
		var finder_sql = options.finder_sql || false;
		var conditions = options.conditions || {};
		var params     = options.params || [];

		association = ActiveSupport.Inflector.singularize(association).toString();

		var Klass = check_if_klass_exists.call(this, association);
		Klass._belongs_to_association = true;

		this.prototype[association] = function(callback){
			params.push(this[foreign_key]);
			conditions.push(Klass.primary_key.concat(" = ?"));
			if (!this[self.primary_key] || !this[foreign_key]){
				throw new Exception.RecordNotFound(Klass).toString();
			}
            foreign_key = foreign_key.concat(" = ?");
			var query = finder_sql ? finder_sql :
				new Query().make_select({
					from: Klass ? Klass.table_name : association.pluralize(),
					conditions: conditions
				})

			var transaction = self.exec_query(query, params, function (data){
				if (data.length > 0){
					for (d in data){
						data[d] = new Klass(data[d]);
					}
				}
				callback ? callback(data, Klass) : [data, Klass];
			});

			if (dependent){
				this.on('before_destroy', function _destroy_dependents(data){
					Klass[dependent+"_all"](Klass.foreign_key.concat(" = ?"), data.get(self.primary_key));
				})
			}

			return Klass;
		}
	}

	this.has_one = this.belongs_to;

	/**
	*	@param {String} association
	*	@param {Object} options
	*
	*	Example:
	*	has_many("foo", {
	*		foreign_key: 'foo_id',
	*		dependent: "destroy" or "delete",
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

		association = ActiveSupport.Inflector.pluralize(ActiveSupport.Inflector.singularize(association));

		var Klass = check_if_klass_exists.call(this, association);
		Klass._has_many_association = true;
		Klass.foreign_key = foreign_key;

		this.prototype[association] = function(callback){
			var conditions  = options.conditions || [];
			var params      = options.params || [];

			Klass.prototype._belongs_to = this;

			params.push(this[self.primary_key]);

			if (!this[self.primary_key]){
				throw new Exception.RecordNotFound(self).toString();
			}

			conditions.push(foreign_key.concat(" = ?"));

			var query = finder_sql ? finder_sql :
				new Query().make_select({
					from: Klass ? Klass.to_s() : association,
					conditions: conditions
				})

			var transaction = self.exec_query(query, params, function (data){
				if (Klass && data.length > 0){
					for (d in data){
						data[d] = new Klass(data[d]);
					}
				}
				/**
				*	Return the Instance & Klass
				*	Example:
				*	User.has_many('phones')
				*	User.find(1, function(u){
				*		user = new User(u[0]);
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
				callback ? callback(data, Klass) : [data, Klass];
			});

			if (dependent===true){
				this.on('before_destroy', function _destroy_all_dependent(data){
					Klass[dependent+"_all"](Klass.foreign_key.concat(" = ?"), data.get(self.primary_key));
				})
			}

			return Klass;
		}
	}

	/**
	*	@param {String} association
	*
	*/
	this.has_many_to_many = function has_many_to_many(association) {

	}

	var check_if_klass_exists = function check_if_klass_exists (association){
		var Klass = null;

		try {
			Klass = require(path.join(process.cwd(), association));
		} catch (e){
			// console.log(new Exception.ActiveRecordError(e).toString());
			Klass = require(path.join(process.cwd(),"..", association));
		}
		this.associations.push(Klass);
		return Klass;
	}
}
