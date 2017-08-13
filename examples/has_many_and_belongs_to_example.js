var ActiveRecord = require('../index');
ActiveRecord.Base.configure_connection({
	"driver": "mysql",
	"hostname": "localhost",
	"user": "root",
	"password": "",
	"database": "active_record"
});
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
Tag.has_many_and_belongs_to('categorias', { join_table: 'categorias_tags' });

console.time("BEGIN");
console.log(Categoria.create({name: 'Descanso'}).errors.full_messages);
console.log(Tag.create({name: 'Lápis'}).errors.full_messages);

Categoria.first(function (error, categoria){
	categoria = categoria[0];

	categoria && categoria.tags(function (error, tags){
		console.log(tags.map(function (tag){ return tag.to_json()}));
	})
	.create({name: 'lambermano'})
})

Categoria.all(function (error, categorias){
	categorias.map(function (categoria){
		console.log(categoria.to_json());
		categoria.tags(function (error, tags){
			tags.map(function (tag){ 
				console.log(tag.to_json()); 
				tag.categorias(function (error, categorias){ 
					console.log(categorias.map(function (categoria){ 
						return categoria.to_json();
					}));
					console.timeEnd("BEGIN");
				}) 
			})
		})
	})
})

setTimeout(ActiveRecord.Base.close_connection, 3000)
