function ActionController (){

	this.index = function index (request, response){
		action_name = "index";
		title = capitalize(Klass.to_s());

		Klass.all(function (error, records){
			if (error) return fail(request, response, error);
			success(response, {
				records: records.map(function (record){ return record.to_json() })
			});
		})
	}

	this.search = function search (request, response, params){
		action_name = "search";
	}

	this.show   = function show (request, response, id){
		action_name = "show";
		Klass.find(id, function (error, record){
			if (error) return fail(request, response, error);
			if (!record[0]) recordNotFound(id, request, response);
			record[0] && success(response, { record: record[0].to_json() });
		})
	}

	this.new    = function _new (request, response){
		action_name = "new";
		attributes(Klass, function (obj){
			success(response, { record: new Klass(obj).to_json() });
		})
	}

	this.create = function create (request, response){
		action_name = "create";
		post(Klass, action_name, request, response)
	}

	this.edit   = function edit (request, response, id){
		action_name = "edit";
		Klass.find(id, function (error, record){
			if (error) return fail(request, response, error);
			if (!record[0]) recordNotFound(id, request, response);
			record[0] && success(response, { record: record[0].to_json() });
		})
	}

	this.update = function update (request, response){
		action_name = "update";
		post(Klass, action_name, request, response)
	}

	this.destroy = function destroy (request, response, id){
		action_name = "destroy";
		Klass.find(id, function (error, record){
			if (error) return fail(request, response, error);
			if (!record[0]) return recordNotFound(id, request, response);
			if (request.method == "GET"){
				record[0] && render('/app/views/destroy.pug', { record: record[0].to_json() }, response);
			} else {
				record[0] && record[0].destroy(function (){
					response.writeHead(200, {"Content-Type": "text/html"});
					flash('warning', capitalize(Klass.table_name) +" #"+ record[0].get('id') +" destroyed with success");
					ActionController.index(request, response);
				})
			}
		})

	}

}

module.exports = ActionController = new ActionController;

/* private */
var fail = function fail (request, response, error){
	response.writeHead(420, {"Content-Type": "text/html"});
	flash('danger', error.message);
	ActionController.index(request, response);
}

var success = function success (response, object){
	response.writeHead(200, {"Content-Type": "text/html"});
	render(path.join('/app/views/', action_name +".pug"), object, response);
}


var recordNotFound = function recordNotFound (id, request, response){
		response.writeHead(420, {"Content-Type": "text/html"});
		flash('danger', capitalize(Klass.table_name) +" #"+ id +" not found");
		ActionController.index(request, response);
}

var post = function post (Klass, method, request, response){
	var object = "";
	request
	.on("data", function (data){ object += data; })
	.on("end", function (){
		object = uriToObject(object);

		var cb = function (error, resp, data){
			if (error) return fail(request, response, error);

			if (data.errors.any){
				response.writeHead(420, {"Content-Type": "text/html"});
				render('/app/views/'+ (method == "create" ? "new" : "edit") +'.pug', {
					errors: data.errors.full_messages,
					record: data.to_json()
				}, response);
			} else {
				response.writeHead(200, {"Content-Type": "text/html"});
				flash('info', capitalize(Klass.table_name) +" #"+ data.get('id') +" "+ method +"d with success");
				ActionController.index(request, response);
			}
		}

		if (method == "create")
			return Klass.create(object, cb);
		else if (method == "update")
			return Klass.update(object.id, object, cb);

	})
}

var uriToObject = function uriToObject (uri){
	return JSON.parse(unescape('{"' + decodeURI(uri.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}'));
}

var attributes = function attributes (Model, cb){
	var object = {};
	ActiveRecord.Base.exec("show fields from "+ Model.table_name, function (error, data){
		for (var i in data)
			object[data[i].Field] = null
		cb(object)
	})
}
