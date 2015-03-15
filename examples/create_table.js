var drop_tables = false;

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
		setTimeout(function() {
			ActiveRecord.Base.close_connection();
		}, 1000);
		return false;
	}
}
