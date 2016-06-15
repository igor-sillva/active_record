var ActiveRecord = require('../index');
ActiveRecord.Base.configure_connection('./database.json');
ActiveRecord.Base.establish_connection();
/* Exports */
exports.Categoria = Categoria;
exports.Tag = Tag;
/* Extends */
ActiveRecord.Base.extend(Categoria, ActiveRecord.Base);
ActiveRecord.Base.extend(Tag, ActiveRecord.Base);
/* Config Models */
function Categoria (){
	this.initialize(arguments[0]);
	this.validates('name', {
		presence: true,
		length: { minimum: 4 }
	});
	this.validate_uniqueness_of('name');
}

function Tag (){
	this.initialize(arguments[0]);
	this.validate_presence_of('name');
	this.validate_length_of('name', { minimum: 4 });
	this.validate_uniqueness_of('name');
}

Categoria.has_many_and_belongs_to('tags');

// Categoria.create({name: 'Descanso'});
// Tag.create({name: 'Lápis'})

Categoria.first(function (error, categoria){
	categoria = categoria[0];

	categoria.tags(function (error, tags){
		console.log(tags.map(function (tag){ return tag.to_json()}));
	})
	.create({name: 'lambermano'}, ActiveRecord.Base.close_connection)
})
