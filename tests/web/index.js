var http = require("http");
var url  = require('url');
var Base = require('../../lib/base');
// var Inflections = require('../pt-BR');
var fs = require('fs');
var querystring = require('querystring');

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

      // if (request.method=="POST")
      // {
      //   request.on('data',
      //     function (data)
      //     {

      //     }
      //   );

      //   request.on('end',
      //     function ()
      //     {

      //     }
      //   );
      // }

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
      			var _user = User.create(JSON.parse(user));

      			if (_user.errors.size > 0)
            {
      				response.writeHead(420)
      				response.write(JSON.stringify(_user.errors.full_messages));
      				_user.errors.clear;
      			}
            else
            {
              // _user.on('before_create', function(data){
              //   response.write(JSON.stringify({message: "User create with success!", data: data.to_object()}));
              //   response.end();
              // })
               response.write(JSON.stringify({message: "User create with success!", data: _user.to_object()}));
      			}
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
    else if (params.pathname=="/update")
    {
      console.time('Update Action');
      response.writeHead(200, {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin":"*"
      });
      if (request.method=="POST")
      {
        var user = "";
        request.on("data",
          function (data){
           user += data;
          }
        )

        request.on("end",
          function ()
          {
            var user=new User(JSON.parse(user));
            user.update_attributes(
              function (r){
                if(r===false)
                {
                  response.writeHead(420);
                  response.write(JSON.stringify({message: "Error on update user."}));
                }
                else
                {
                  response.write(JSON.stringify({message: "User #"+user.id+" updated with success."}));
                }
                response.end();
            });
          }
        )
        console.timeEnd('Delete Action')

      }
      else
      {

          response.write(JSON.stringify({message: "You not authorized to this action."}))
          response.end();

      }
      console.timeEnd('Update Action');

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
    		  	var user=new User(JSON.parse(id));
    		  	user.destroy(
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
