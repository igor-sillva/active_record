var ActiveRecord = require('../active_record')
	, Base = require('../base')
	, inherits = require('util').inherits
	, Inflection   = require('inflections')
	, Query = require('../relations/query')
	, Error = require('../error')
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
	this.belongs_to = function (association) {
		var self = this;
		association = Array.isArray(association) ? association[0] : association;
		this.prototype[association] = function( callback ){
			var foreign_key = self.get('foreign_key') || association.concat('_id'); // Default ForeignKey = <model>_id
			self.find(this.id, function(data){
				var query = new Query().make_select({
					from: association.pluralize(),
					conditions: 'id = ?'
				})
				if( data[foreign_key] )
					return new Transaction().exec_query(query, data[foreign_key], callback);
				return null;
			})
		}
	}

	this.has_one = this.belongs_to;
	
	/**
	*	@param {String} association
	*	
	*/
	this.has_many = function (associations) {
		var self = this;
		associations = Array.isArray(associations) ? associations : [associations];
		for(var i=0; i < associations.length; i++){
			var association = associations[i]
			var foreign_key = self.get('foreign_key') || self.get('table_name').singularize().concat('_id = ?');
			this.prototype[association] = function( callback ){
				self.find(this.id, function(data){
					var query = new Query().make_select({
						from: association,
						conditions: foreign_key ? foreign_key : foreign_key.concat(' = ?')
					})
					if ( data ){
						return new Transaction().exec_query(query, data['id'], function (data){
							return callback ? callback(data) : data;
						});
					}
				})
			}
		}
	}

	/**
	*	@param {String} association
	*	
	*/
	this.has_many_to_many = function (associations) {
		
	}
}