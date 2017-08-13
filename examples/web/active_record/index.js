// var config = require(__dirname +'/config/application.json');
/* Modules */
exports.http 				= http 				= require("http");
exports.url  				= url  				= require('url');
exports.path 				= path 				= require('path');
exports.fs   				= fs   				= require('fs');
exports.querystring = querystring = require('querystring');
exports.pug         = pug         = require('pug');

/* ActiveRecord */
exports.ActiveRecord = ActiveRecord = require(__dirname +'/../../../index');

/* Load configurations */
// ActiveRecord.configure("cache_query", false);
ActiveRecord.Base.configure_connection({
	"driver": "mysql",
	"hostname": "localhost",
	"port": "3306",
	"user": "root",
	"password": "",
	"database": "active_record"
})
// ActiveRecord.Base.configure_connection(__dirname +'/config/database.json');
/* Establish_connection */
ActiveRecord.Base.establish_connection();

/* Console */
var Console = require(__dirname +'/scripts/console');

/* Helpers */
exports.capitalize  = capitalize  = ActiveRecord.ActiveSupport.Inflector.capitalize;
exports.singularize = singularize = ActiveRecord.ActiveSupport.Inflector.singularize;
exports.class_name  = class_name  = null;
exports.action_name = action_name = "index";
exports.id          = id          = null;
exports.Klass       = Klass       = null;
exports.Flash       = Flash       = [];
exports.VERSION     = VERSION     = "v1.6";

exports.render = render = function render (file, options, response){
	response.end(pug.renderFile(path.join(__dirname, file), options || {}));
}

exports.redirect_to = redirect_to = function (file, options, response){
	response.writeHead(301, {	Location: '/'	});
	var compiledFile = pug.compileFile(path.join(__dirname, file));
	response.end(compiledFile(options || {}));
}

exports.root_path = root_path = function (response){
	response.writeHead(301, {	Location: '/'	});
	var compiledFile = pug.compileFile(path.join(__dirname, file));
	response.end(compiledFile(options || {}));
}

exports.index = index = function index (request, response, options){
	response.writeHead(200, {"Content-Type": "text/html"});
	options = options || {};
	title = "";
	render('/app/views/layout.pug', options, response);
}

exports.help  = help = function help (request, response){
	response.writeHead(200, {"Content-Type": "text/html"});
	render('/app/views/help.pug', { VERSION: 'v1.6' }, response);
}

exports.wiki  = wiki = function wiki (request, response){
	response.writeHead(200, {"Content-Type": "text/html"});
	render('/app/public/README.md', { VERSION: 'v1.6' }, response);
}

exports.flash = flash = function flash (type, message){
	Flash.push({
		type: type,
		message: message
	})
}

/* Models */
exports.User 	= User 	= require(__dirname +'/app/models/user');
exports.Phone = Phone = require(__dirname +'/app/models/phone');
exports.Models = Models = [User, Phone];
/* Controllers */
exports.ActionController = ActionController = require(__dirname +'/app/controllers/action_controller');

/* Server */
var server = http.createServer(function (request, response){

	var params = url.parse(request.url, true);

	var pathname = params.pathname.split('/');
	class_name  = pathname[1] || null;
	action_name = pathname[2] || null;
	id          = pathname[3] || null;
	if (class_name) Klass = exports[capitalize(singularize(class_name))];

	log("\n\n\033[1;34m%s \033[0m%s (%s)\033[0m", request.method, request.url, request.connection.remoteAddress);
	if (params.query && params.method == "GET")
		log("Parameters: %j", params.query);

	/* Draw Routes for Class */
	if (Klass){
		if (params.pathname == "/"+ class_name ){
			return ActionController.index(request, response); // Index
		} else if (params.pathname == "/"+ class_name +"/search"){
			return ActionController.search(request, response, params.query); // Search
		} else if (params.pathname == "/"+ class_name +"/new"){
			return ActionController.new(request, response); // New
		} else if ((new RegExp('\/'+ class_name +'\/show\/\\d+').test(params.pathname))){
			return ActionController.show(request, response, id); // Show
		}	else if ((new RegExp('\/'+ class_name +'\/edit\/\\d+')).test(params.pathname)){
			return ActionController.edit(request, response, id); // Edit
		}	else if ((new RegExp('\/'+ class_name +'\/destroy\/\\d+')).test(params.pathname)){
			return ActionController.destroy(request, response, id); // Destroy
		} else if ((new RegExp("\/"+ class_name +"\/[create, update]").test(params.pathname)) && request.method == "POST"){
			return ActionController[action_name](request, response); // Create and Update
		}
	}

	switch (params.pathname){
		/* Console */
		case '/console': _console(request, response); break;
		/* Index */
		case '/': index(request, response); break;
		/* Help */
		case '/help': help(request, response); break;
		/* Wiki*/
		case '/wiki': wiki(request, response); break;
		default:
			var filePath = path.join('.', request.url);
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
							flash("danger", error.message)
							return index(request, response);
						} else {
							response.writeHead(200, { 'Content-Type': contentType });
							response.end(content, 'utf-8');
						}
					});
				} else {
					response.writeHead(404);
					flash("danger", "Page not found")
					return index(request, response);
				}
			});
	}

})

/* Start Server on port 3000 */
server.listen(3000, function (){
	log("Server UP - Listen on Port: 3000\n");
});

/* Private */
var _console = function _console (request, response){
	title = "Console"

	if (request.method == "GET"){
		response.writeHead(200, { 'Content-Type': 'text/html' });
		render('/app/views/console.pug', {}, response);
		return;;
	}

	response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" });
	var command = "";
	var out;

	request.on("data", function (data){
		command += data;
	})

	request.on("end", function (){
		// User::all { id_gt: 10 }, function (error, users){ log users }
		// console.log(JSON.parse(command)
		command = JSON.parse(command).command;
		process.stdout.write("\x1b[1;31m>_ : \x1b[1;32m"+ command +"\x1b[0m\n");
		process.stdout.write('  ');
		try {
			out = "";
			out = eval(command);
			response.write(JSON.stringify({
				stdout: ""+ out +""
			}))
		} catch (error){
			response.write(JSON.stringify({
				stderr: error.name +": "+ error.message.trim()
			}))
		}

		response.end();
	});

}

var minifieCommand = function (command, callback){

	var query = querystring.stringify({
    input : unescape(command)
	});

	var req = http.request({
        method   : 'POST',
        hostname : 'javascript-minifier.com',
        path     : '/raw',
	    }, function(resp) {
	        // if the statusCode isn't what we expect, get out of here
        if ( resp.statusCode !== 200 ) {
          console.log('StatusCode=' + resp.statusCode);
          return;
        }
        resp.pipe(callback);
	    }
	);
	req.on('error', function(err) {
    throw err;
	});
	req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.setHeader('Content-Length', query.length);
	req.end(query, 'utf8');
	callback(query);
}

var drawRoute = function route (request, response){

}


