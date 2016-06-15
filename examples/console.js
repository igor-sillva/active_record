#!/usr/bin/env node
process.title = "active_record";
/* ActiveRecord */
var ActiveRecord = require(__dirname +'/../index');
ActiveRecord.configure('default_models_path', '.')
ActiveRecord.Base
.configure_connection(__dirname +'/database.json')
.establish_connection();
/* Models */
var User = require('./user');
var Phone = require('./phone');
/***************************************************
*									COMMAND line										 *
***************************************************/
// console.log("\033[1;30mCOMMAND ActiveRecord --> \033[1;32m[OK]\033[0m");
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('active_record > ');
prompt();

rl.on('line', function (cmd) {
  try { eval(cmd); prompt(); }
	catch (e) { console.log("\033[1;31m"+ e.message.trim() +"\033[0m" ); prompt();}
});

function prompt (){
	rl.pause();
	setTimeout(function (){
		rl.prompt();
		rl.resume()
	}, 300)
}

// Alias
var see = function (error, users){
	if (users){ users.map(function (user){ console.log(user.to_json() ) } )}
}

var log = console.log

var user = new User();
user.set('name', 'Igoraa');
user.set('password', 'asdasdsad');
