var assert = require('assert');
var test   = require('utest');
var $      = require('./helpers').Models;

test('ActiveRecord#Associations', {

	before: function (){
		this.user = $.User.create({
			name: 'foo',
			password: 'foo'
		})

		this.phone = $.Phone.create({
			number: '9999-9999',
			user_id: this.user.get('id')
		})
	},

	after: function (){
		$.User.all(function (e, users){
			users.map(function (user){
				console.log(user.to_json())
			})
		})
	},

	'belongs_to': function (){
		$.Phone.belongs_to('user');
		$.Phone.first(function (error, phone){
			phone[0] && phone[0].user(function (error, user){
				assert.equal(user[0].get('name'), 'foo');
			})
		})
	},

	'has_one': function (){
		$.Phone.has_one('user');
		$.Phone.first(function (error, phone){
			phone[0] && phone[0].user(function (error, user){
				console.log(user[0].to_json());
			})
		})
	},

	'has_many': function (){
		$.User.has_many('phones');
		$.User.first(function (error, user){
			user[0] && user[0].phones(function (error, phones){
				console.log(phones.map(function (phone){
					return phone.to_json();
				}))
			})
			.create({
				number: '9999-9999'
			})
		})
	},

	'has_many_and_belongs_to': function (){
		$.Categorie.has_many_and_belongs_to('tags');
		$.Categorie.first(function (error, categorie){
			categorie[0] && categorie[0].tags(function (error, tags){
				console.log(tags.map(function (tag){
					return tag.to_json();
				}))
			})
			.create({
				name: 'foo'
			})
		})
	}
})



