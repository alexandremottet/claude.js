var crypto = require('crypto');

function decrypt() {
	crypto.pbkdf2('azerty', 'salt', 4096, 16, 'sha256', function(err, key) {
		var decipher = crypto.createDecipheriv('aes-256-gcm', key.toString('hex'), '6de07d727197')
		var dec = decipher.update('395562d1928779c69c', 'hex', 'utf8')
		console.log(dec);
	});
}

decrypt();