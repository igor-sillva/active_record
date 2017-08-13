module.exports = QueryCache

function QueryCache (){

	/*
	*
	*/
	this.records = [];

	/*
	*
	*/
	this.add = function add(query, response){
		var object = {
			query: query,
			response: response
		}

		if (/^SELECT/.test(query) || /^DELETE/.test(query)){
			this.records.push(object);
		} else {
			this.clear();
		}
	};

	/*
	*
	*/
	this.remove_record_by = function remove_record_by(key, value){
		for (i=0; i<this.records.length, cache = this.records[i]; i++){
			for (j=0; j<cache.response.length; j++){
				var match = cache.response[j][key] ? cache.response[j][key].toString() : "";
				if (match === (new String(value)).toString()){
					cache.response.splice(cache.response.indexOf(cache.response[j]),1);
				}
			}
		}
	}

	/*
	*
	*/
	this.search_by_query = function search_by_query(query){
		for (i=0; i<this.records.length; i++){
			if (this.records[i].query == query){
				return this.records[i];
			}
		}
	}

	/*
	*
	*/
	this.clear = function clear(){
		this.records = [];
	};

}
