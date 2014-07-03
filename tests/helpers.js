var crypto = require('crypto');

exports.createName = String.random = function (length){
	length = length || 4;
	l = "abcdefghijklmnopqrstuvxwyz ";
	name = []
	for( i=0; i<length; i++){
		name.push(l[Math.round(Math.random() * l.length + 1)]);
	}
	return name.join("").toString();
}

exports.to_crypto = String.prototype.to_crypto = function (key){
	k = key ? key : this;
	return crypto
	.createHash("md5")
	.update(k.toString())
	.digest("hex");
}


exports.makeArray = Array.new = function (length){
	array = [];
	if(!length) return []
	for(i=0; i<length;i++)
		array.push(i)
	return array;
}