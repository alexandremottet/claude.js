var fs = require('fs');
var mock = require('mock-fs');
var token = require('../token');

beforeEach(function(){
	mock({
	  '/Volumes/TESTUSB/' : {
	  	'autosync-token': '{"token":"6de07d727197.395562d1928779c69c"}'
	  }
	});
})

describe('token test', function(){
    it('test mock', function(done){
		token.isValid('/Volumes/TESTUSB', 'azerty', function(isValid) {
			console.log(isValid);
			done();
		});
    })
})

afterEach(function(){
	mock.restore()
})

