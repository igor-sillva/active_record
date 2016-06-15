var http = require("http");
var url  = require('url');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');

var ActiveRecord = require('../console.js').ActiveRecord
//require('../../index');
// ActiveRecord.configure('default_models_path', "/../");
// ActiveRecord.Base
// .configure_connection('../database.json')
// .establish_connection();

var User = require('../user.js');

http.createServer(function (request, response){
	var params = url.parse(request.url, true)
	var index = "";

	console.log("\n\033[1;34m%s \033[0m%s (%s)\033[0m", request.method, request.url, request.connection.remoteAddress);
	if (params.query)
		console.log("  Parameters: %j\n", params.query);
	else console.log("\n")

	if (params.pathname=="/index" || params.pathname=="/"){
		index = fs.readFileSync('./index.html');
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(index);
	} else if (params.pathname=="/search"){
		response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
		var query=params.query.q;
		var page=params.query.page || 0;
		var force=params.query.force || "false";

		if (force=="true") User.cache.clear()
		if (page > 0) page = (page * 15);

		var conditions = { name_like: "%"+ escape(query) +"%" }
		User.where({ conditions: conditions, order: 'id', limit: 15, offset: page },
		function (error, users){
			if (error){
				response.writeHead(420);
				response.write(JSON.stringify({message: error.name +':'+ error.message}));
				response.end();
				return false
			}

			if (users && users.length == 0){
				response.write(JSON.stringify({message: "User not found."}));
				response.end();
			} else {

				User.count('*', conditions, function (error, total){
					User.join('phones', { conditions: conditions, order: 'id', limit: 15, offset: page },
					function (error, phones){
						users = users.map(function (user){
							phones.map(function (phone){
								if (phone.get('user_id') == user.get('id')){
									if ( !Array.isArray(user.get('phones')) ) user.set('phones', []);
									user.get('phones').push(phone.to_object());
								}
							})
							return user.to_object();
						})
						response.write(JSON.stringify({ records: users, total: total }));
						response.end();
					})
				})
			}
		})

	} else if (params.pathname=="/new"){
		response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
		if (request.method=="POST"){
			var data = "";
			request.on("data", function (d){
				data += d;
			})

			request.on("end", function (){
				var user = new User(JSON.parse(data))

				user.save(function (error, data, record){
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

				if (user && user.errors.size > 0){
					response.writeHead(420)
					response.write(JSON.stringify(user.errors.full_messages));
					response.end();
				}

		})

		} else {
			response.write(JSON.stringify({
				message: "You not authorized to this action."
			}))
			response.end();
		}
	} else if (params.pathname=="/update"){
		response.writeHead(200, {
			'Content-Type': 'application/json',
			"Access-Control-Allow-Origin":"*"
		});
		if (request.method=="POST"){
			var data = "";
			request.on("data", function (d){
				data += d;
			})

			request.on("end", function (){
				var user = new User(JSON.parse(data)[0]);
				user.update_attributes(JSON.parse(data)[1].attr,
				function (error, data){
					if (error){
						response.writeHead(420);
						response.write(JSON.stringify({message: [error.message]}));
						response.end();
					} else {
						response.write(JSON.stringify({
							message: "User #"+this.id+" updated with success.",
							data: this.to_object()
						}));
						response.end();
					}
				})

				if (user && user.errors.size > 0){
					response.writeHead(420)
					response.write(JSON.stringify({message: user.errors.full_messages}));
					response.end();
				}
			})
	  } else {
		response.write(JSON.stringify({message: "You not authorized to this action."}))
		response.end();
	  }

	} else if (params.pathname=="/delete"){
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
			})
		} else {
			response.write(JSON.stringify({message: "You not authorized to this action."}))
			response.end();
		}

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
