var http = require("http");
var url  = require('url');
var ActiveRecord = require('../../index');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');

ActiveRecord.configure('default_models_path', '../');

ActiveRecord.Base.connection.set('env', 'prod');
ActiveRecord.Base.configure_connection('../database.json')
// ActiveRecord.Base.configure_connection({
// 	"driver": "sqlite3",
// 	"filename": "../active_record_tests.sqlite3"
// });

ActiveRecord.Base.establish_connection();

http.createServer(function (request, response){
	var User = require('../user.js');
	var params = url.parse(request.url, true)
	var index = "";
	if (params.pathname=="/index" || params.pathname=="/"){
		console.time('Index Action');
		index = fs.readFileSync('./index.html');
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(index);
		console.timeEnd('Index Action');
	} else if (params.pathname=="/search"){
		var page = params.query.page || 0;
		if (page > 0) page = (page * 30) + 1;
		console.time('Search Action');
		response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
		var query=params.query.q;
		User.where({name_like: "%"+ escape(query) +"%"}, function (error, users){
			if (error){
				response.writeHead(420);
				response.write(JSON.stringify({message: [error.message]}));
				response.end();
			}

			if (users && users.length == 0){
				response.write(JSON.stringify({message: "User not found."}));
				response.end();
			} else {
				response.write(JSON.stringify(users.map(function(user){ return user.to_object() })));
				response.end();
			}
			console.timeEnd('Search Action')
		})

	} else if (params.pathname=="/new"){
		console.time('New Action')
		response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
		if (request.method=="POST"){
			var user = "";
			request.on("data", function (data){
				user += data;
			})

			request.on("end", function (){
				var _user = User.create(JSON.parse(user), function (error, data, record){
					if (error) {
						response.writeHead(420);
						response.write(JSON.stringify({message: [error.message]}));
						response.end();
					}

					if (data){
						response.write(JSON.stringify({
							message: "User create with success!",
							data: [data.insertId, record.to_object()]
						}));
						response.end();
					}
				});

				if (_user && _user.errors.size > 0){
					response.writeHead(420)
					response.write(JSON.stringify(_user.errors.full_messages));
					response.end();
				}
				console.timeEnd('New Action');
			})

		} else {
			response.write(JSON.stringify({
				message: "You not authorized to this action."
			}))
			response.end();
		}
	} else if (params.pathname=="/update"){
		console.time('Update Action');
		response.writeHead(200, {
			'Content-Type': 'application/json',
			"Access-Control-Allow-Origin":"*"
		});
		if (request.method=="POST"){
			var user = "";
			request.on("data", function (data){
				user += data;
			})

			request.on("end", function (){
				var __user = JSON.parse(user);
				var _user=new User(__user[0]);
				_user.update_attributes(__user[1].attr, function (error, data){
					if (error){
						response.writeHead(420);
						response.write(JSON.stringify({message: [error.message]}));
						response.end();
					} else {
						if(!data || data.changedRows==0){
							response.write(JSON.stringify({message: 'Nothing to do.' }));
						} else {
							response.write(JSON.stringify({
								message: "User #"+this.id+" updated with success.",
								data: this.to_object()
							}));
						}
						response.end();
					}
				})

				if (_user && _user.errors.size > 0){
					response.writeHead(420)
					response.write(JSON.stringify({message: _user.errors.full_messages}));
					response.end();
				}
				console.timeEnd('Update Action');
			})
	  } else {
		response.write(JSON.stringify({message: "You not authorized to this action."}))
		response.end();
	  }

	} else if (params.pathname=="/delete"){
		console.time('Delete Action');
		response.writeHead(200, {
			'Content-Type': 'application/json',
			"Access-Control-Allow-Origin":"*"
		});
		if (request.method=="POST"){
			var id = "";
			request.on("data", function (data){
				 id += data;
			})

			request.on("end", function (){
				var user=new User(JSON.parse(id));

				user.destroy(function (error, r){
					if (error){
						response.writeHead(420);
						response.write(JSON.stringify({message: [error.message]}));
						response.end();
					} else {
						if(r===false && r==null){
							response.writeHead(420);
							response.write(JSON.stringify({message: "Error on destroy user."}));
						} else {
							response.write(JSON.stringify({message: "User #"+user.get('id')+" destroyed with success."}));
						}
					}
					response.end();
				});

				if (user && user.errors.size > 0){
					response.writeHead(420)
					response.write(JSON.stringify({message: user.errors.full_messages}));
					response.end();
				}
				console.timeEnd('Delete Action')
			})
		} else {
			response.write(JSON.stringify({message: "You not authorized to this action."}))
			response.end();
		}

	} else if (params.pathname=="/getPhones"){
		response.writeHead(200, {
			'Content-Type': 'application/json',
			"Access-Control-Allow-Origin":"*"
		});
		if (request.method=="GET"){
			var user_id=params.query.user_id;
			var user = new User({id: user_id});

			user.phones(function (error, phones){
				if (error){
					response.write(JSON.stringify({message: error.message}));
					response.end();
				}
				if (phones){
					response.write(JSON.stringify(phones.map(function (phone){ return phone.to_object() })));
					response.end()
				}
				response.end();
			})
		} else response.end(JSON.stringify({ message: "You not authorized to this action." }))
	} else {
		var filePath = '.' + request.url;
		var extname = path.extname(filePath);
		var contentType = '';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
		}

		fs.exists(filePath, function(exists) {
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					} else {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
				});
			} else {
				response.writeHead(404);
				response.end();
			}
		});
	}
}).listen(3000);
