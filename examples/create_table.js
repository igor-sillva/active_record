var drop_tables = true;
var ActiveRecord = require('../index');
ActiveRecord.Base.configure_connection('./database.json');
ActiveRecord.Base.establish_connection();

exports.createTable = function createTable(){
	if (drop_tables){
		var driver = ActiveRecord.Base.connection.get('driver');
		var auto_increment = driver == 'sqlite3' ? 'AUTOINCREMENT' : driver == 'postgres' ? '' : 'auto_increment';
		var pk = driver == 'postgres' ? 'id serial primary key' : "id integer primary key "+ auto_increment;
		ActiveRecord.Base.connection.conn.query("drop table if exists phones");
		ActiveRecord.Base.connection.conn.query("drop table if exists users");
		ActiveRecord.Base.connection.conn.query("create table if not exists users (\
			 "+ pk +", name varchar(50) not null,\
			password varchar(50) not null, updated_at timestamp not null,\
			created_at timestamp not null\
		)");
		ActiveRecord.Base.connection.conn.query("create table if not exists phones (\
			"+ pk +", number varchar(11) not null,\
			user_id integer, updated_at timestamp not null,\
			created_at timestamp not null, foreign key(user_id) references users(id) on update cascade on delete set null\
		)");

		ActiveRecord.Base.connection.conn.query("create table if not exists categorias (\
			"+ pk +", name varchar(50) not null, updated_at timestamp not null, created_at timestamp not null\
		)");
		ActiveRecord.Base.connection.conn.query("create table if not exists tags (\
			"+ pk +", name varchar(50) not null, updated_at timestamp not null, created_at timestamp not null\
		)");
		ActiveRecord.Base.connection.conn.query("create table if not exists categorias_tags (\
			"+ pk +", categoria_id integer, tag_id integer,\
			updated_at timestamp not null, created_at timestamp not null,\
			foreign key(categoria_id) references categorias(id) on update cascade on delete cascade,\
			foreign key(tag_id) references tags(id) on update cascade on delete cascade\
		)");
		setTimeout(function() {
			ActiveRecord.Base.close_connection();
		}, 10000);
		return false;
	}
}()
