var fs = require('fs');
var crypt = require('./crypt');
var crypto = require('crypto');
var path = require('path');

var tokenFileName = '.autosync-token';

function generate(volumePath, localPath, callback) {
    console.log('Generating tokens...');
    crypto.randomBytes(64, function(exc, buf) {
        if(exc) callback('Cannot generate the tokens.');
        console.log('Writing token in', path.join(volumePath, tokenFileName));
        fs.writeFile(path.join(volumePath, tokenFileName), buf, function(exc) {
            if(exc) callback('Cannot write the token on the volume.');
            
            console.log('Writing token in', path.join(localPath, tokenFileName));
            fs.writeFile(path.join(localPath, tokenFileName), buf, function(exc) {
                if(exc) callback('Cannot write the token on the local repo.');
                callback('Everything went fine.');
            });
        });
    });
}

function exist(device) {
	var exist = false;
	var files = fs.readdirSync(device+'/');
	files.forEach(function(file_name, index, array) {
		if(file_name == 'autosync-token' && fs.statSync(device+'/autosync-token').isFile() ) {
			exist = true;
		}
	});
	return exist;
}

function isValid(device, password, callback) {
	var content = JSON.parse(fs.readFileSync(device+'/'+tokenFileName, {encoding:'utf8'}))
	var token = content.token.split('.')
	crypt.decrypt(token[1], password, token[0], function(text) {
		var exist = (text === 'claude.js')
		callback(exist);
	})
}

var token = {
	exist: exist,
	isValid: isValid,
	generate: generate
}

module.exports = token