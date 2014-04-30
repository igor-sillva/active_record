var ActiveRecord = require('../active_record')
	, Base = require('../base')
	, inherits = require('util').inherits
	, Inflection   = require('inflections')
	, Query = require('../relations/query')
	, Error = require('../error')
	, path = require('path')
	, Transaction = require('../transaction');

module.exports = Association

inherits(Association, ActiveRecord)
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
	*	
	*/
	this.belongs_to = function belongs_to (association) {
		var self = this;
		association = association.singularize().toString();
		this.prototype[association] = function( callback ){
			var foreign_key = self.get('foreign_key') || association.concat('_id'); // Default ForeignKey = <model>_id

			if (!this.id || !this[foreign_key]){
				throw new Error.RecordNotFound(self).toString();
			}

			var Klass = null;
			try {
				Klass = require(path.join(process.cwd(), association));
			} catch (e){

			}
			var query = new Query().make_select({
				from: Klass ? Klass.get('table_name') : association.pluralize(),
				conditions: 'id = ?'
			})
			
			new Transaction().exec_query(query, this[foreign_key], function (data){
				if (Klass && data.length > 0){
					for (d in data){
						data[d] = new Klass(data[d]);
					}
					callback ? callback(data, Klass) : [data, Klass];
				}
				callback ? callback(data) : data;
			});

			return Klass;
		}
	}

	this.has_one = this.belongs_to;
	
	/**
	*	@param {String} association
	*	
	*/
	this.has_many = function has_many (association) {
		var self = this;
		association = association.pluralize();
		var foreign_key = self.get('foreign_key') || self.get('table_name').singularize().concat('_id = ?');
		this.prototype[association] = function( callback ){
			if (!this.id){
				throw new Error.RecordNotFound(self).toString();
			}

			var Klass = null;			
			try {
				Klass = require(path.join(process.cwd(), association));
			} catch (e){
				// TODO
			}
			var query = new Query().make_select({
				from: Klass ? Klass.get('table_name') : association,
				conditions: foreign_key ? foreign_key : foreign_key.concat(' = ?')
			})

			new Transaction().exec_query(query, this.id, function (data){
				if (Klass && data.length > 0){
					for (d in data){
						data[d] = new Klass(data[d]);
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
					return callback ? callback(data, Klass) : [data, Klass];
				}
				return callback ? callback(data) : data;
			});

			return Klass;
		}
	}

	/**
	*	@param {String} association
	*	
	*/
	this.has_many_to_many = function has_many_to_many(associations) {
		
	}
}