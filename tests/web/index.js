var http = require("http");
var url  = require('url');
var Base = require('../../lib/base');
// var Inflections = require('../pt-BR');
var fs = require('fs');
var querystring = require('querystring');
var _ = require('../helpers');

Base.configure_connection('../database.json');
Base.establish_connection();

var User = require('../user.js');

http.createServer(
  function (request, response)
  {

    var params = url.parse(request.url, true)
    var index = "";

    if (params.pathname=="/index" || params.pathname=="/")
    {

      console.time('Index Action');
    	index = fs.readFileSync('../web/index.html');
    	response.writeHead(200, {"Content-Type": "text/html"});
    	response.end(index);
      console.timeEnd('Index Action');

    }
    else if (params.pathname=="/search")
    {

      console.time('Search Action');
    	response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });

    	var query=params.query.q.split(' ').map(function (v){ return "name LIKE '%"+escape(v)+"%'"}).join(' OR ');

    	User.where(query, function (users)
      {

    		if (users.length == 0)
        {
    			response.write(JSON.stringify({message: "User not found."}))
    		}
        else
        {
    			response.write(JSON.stringify(users));
    		}
    		response.end();

    	})
      console.timeEnd('Search Action')

    }
    else if (params.pathname=="/new")
    {

    	console.time('New Action')
    	response.writeHead(200, { 'Content-Type': 'application/json', "Access-Control-Allow-Origin":"*" });
    	if (request.method=="POST")
      {
    		var user = "";
    		request.on("data",
          function (data)
          {
      			user += data;
      		}
        )

    		request.on("end",
          function ()
          {
      			 // user = new
      			User.create(JSON.parse(user));
      			 // console.log(user._attributes)
    			   // user.save();

      			if (User.errors.size() > 0)
            {
      				response.writeHead(420)
      				response.write(JSON.stringify(User.errors.full_messages()));
      				User.errors.clear();
      			}
            else
            {
      				response.write(JSON.stringify({message: "User create with success!"}));
      			}

      			process.ACTIVERECORD.CACHE = []
      			response.end();
      		}
        )

    	}
      else
      {

    		response.write(JSON.stringify({
          message: "You not authorized to this action."
        }))
    		response.end();

    	}
      console.timeEnd('New Action');

    }
    else if (params.pathname=="/delete")
    {

    	console.time('Delete Action')
    	response.writeHead(200, {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin":"*"
      });
    	if (request.method=="POST")
      {
  	  	var id = "";
    		request.on("data",
          function (data){
    			 id += data;
    		  }
        )

    		request.on("end",
          function ()
          {
    		  	var id=new User(JSON.parse(id));
    		  	User.destroy(
              function (r){
      		  		if(r===false)
                {
      		  			response.writeHead(420);
      		  			response.write(JSON.stringify({message: "Error on destroy user."}));
      		  		}
                else
                {
      		  			response.write(JSON.stringify({message: "User #"+user.id+" destroyed with success."}));
      		  		}
      		  		response.end();
    		  	});
    		  	process.ACTIVERECORD.CACHE = [];
    	  	}
        )
        console.timeEnd('Delete Action')

    	}
      else
      {

      		response.write(JSON.stringify({message: "You not authorized to this action."}))
      		response.end();

      }

    }
    else
    {

      console.time('Error 404')
    	response.writeHead(404, {'Content-Type' : 'text/html'});
    	response.write("<h1>Error 404: Page not found.</h1>");
    	response.end();
      console.timeEnd('Error 404')

    }

}).listen(3000);
