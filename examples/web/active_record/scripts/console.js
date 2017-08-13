#!/usr/bin/env node
process.title = "active_record";
/***************************************************
*									COMMAND line										 *
***************************************************/
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.setPrompt('active_record > ');
prompt();

rl.on('line', function (cmd) {
  try { eval(cmd); prompt();  }
	catch (e) { console.log("\033[1;31m"+ e.message.trim() +"\033[0m\n" ); prompt();}
});

function prompt (){
	rl.pause();
	setTimeout(function (){
		rl.prompt();
		rl.resume();
	}, 300)
}

// Alias
exports.each = each = function (error, records){
	if (records){ records.map(function (record){ console.log(record.to_json() ) } )}
}

exports.log = log = console.log

