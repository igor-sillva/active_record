module.exports = QueryCache

function QueryCache (){

	/*
	*
	*/
	this._cache = [];

	/*
	*
	*/
	this.add = function add(query, response){
		var object = {
			query: query,
			response: response
		}

		if (/^SELECT/.test(query) || /^DELETE/.test(query)){
			this._cache.push(object);
		} else {
			this.clear();
		}
	};

	/*
	*
	*/
	this.remove_record_by = function remove_record_by(key, value){
		for (i=0; i<this._cache.length, cache=this._cache[i]; i++){
			for (j=0; j<cache.response.length; j++){
				if (cache.response[j][key].toString() === value && value.toString()){
					cache.response.splice(cache.response.indexOf(cache.response[j]),1);
				}
			}
		}
	}

	/*
	*
	*/
	this.search_by_query = function search_by_query(query){
		for (i=0; i<this._cache.length; i++){
			if (this._cache[i].query==query){
				return this._cache[i];
			}
		}
	}

	/*
	*
	*/
	this.clear = function clear(){
		this._cache = [];
	};

}
