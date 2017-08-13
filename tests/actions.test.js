var assert = require('assert');
var test   = require('utest');
var $      = require('./helpers').Models;

test('ActiveRecord#Actions', {
	'before': function (){
		this.user = new $.User({
			name: 'foo',
			password: 'foo'
		})
	},

	'create': function (){
		this.user.save(function (){
			assert.ok(true);
		})
	}
})
