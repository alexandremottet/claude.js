var fs = require('fs');
var crypt = require('./crypt');

var tokenFileName = 'autosync-token'
function generate(volume, password, callback) {

	crypt.encrypt('claude.js', password, function(token) {
		var encryptedToken = {};
		encryptedToken.token = token.iv+'.'+token.encrypted;
		fs.writeFile(volume+'/'+tokenFileName, JSON.stringify(encryptedToken), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("JSON saved to " + '/Volumes/'+volume+'/autosync-token');
				callback();
			}
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

function isValid(device, password) {
	var content = JSON.parse(fs.readFileSync(device+'/'+tokenFileName, {encoding:'utf8'}))
	var token = content.token.split('.')
	crypt.decrypt(token[1], password, token[0], function(text) {
		console.log(text);
	})
}

var token = {
	exist: exist,
	isValid: isValid,
	generate: generate
}

module.exports = token