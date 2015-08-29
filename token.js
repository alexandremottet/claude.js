var fs = require('fs');
var crypt = require('./crypt');
var crypto = require('crypto');
var path = require('path');

var tokenFileName = require('./global').tokenFileName;

// Generates a pair of tokens in volumePath/tokenFileName and localPath/tokenFileName
function generate(volumePath, localPath, callback) {
    console.log('Generating tokens...');
    crypto.randomBytes(64, function(exc, buf) {
        if(exc) {
            callback('Cannot generate the tokens.');
            return;
        }
        console.log('Writing token in', path.join(volumePath, tokenFileName));
        fs.writeFile(path.join(volumePath, tokenFileName), buf, function(exc) {
            if(exc) {
                callback('Cannot write the token on the volume.');
                return;
            }
            
            console.log('Writing token in', path.join(localPath, tokenFileName));
            fs.writeFile(path.join(localPath, tokenFileName), buf, function(exc) {
                if(exc) callback('Cannot write the token on the local repo.');
                else {
                    require('./global').repoTable[localPath] = buf;
                    callback(null);
                }
            });
        });
    });
}

function exist(device) {
	var exist = false;
	var files = fs.readdirSync(device);
	files.forEach(function(file_name, index, array) {
		if(file_name == tokenFileName && fs.statSync(path.join(device,tokenFileName).isFile())) {
			exist = true;
		}
	});
	return exist;
}

function isValid(device, password, callback) {
	var content = JSON.parse(fs.readFileSync(path.join(device,tokenFileName), {encoding:'utf8'}))
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