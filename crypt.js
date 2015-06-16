var crypto = require('crypto')

var algorithm = 'aes-256-gcm';

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
}

function createPassKey(password, callback) {

    crypto.pbkdf2(password, 'salt', 4096, 16, 'sha256', function(err, key) {
    	callback(key.toString('hex'));
	});

}

function decrypt(text, password, iv, callback) {
	crypto.pbkdf2(password, 'salt', 4096, 16, 'sha256', function(err, key) {
		var decipher = crypto.createDecipheriv(algorithm, key.toString('hex'), iv)
		var dec = decipher.update(text, 'hex', 'utf8')
		callback(dec);
	});
}

function encrypt(text, password, callback) {
    createPassKey(password, function(key) {

		var iv = randomValueHex(12);
		var cipher = crypto.createCipheriv(algorithm, key, iv);
		var encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		token = {};
		token.iv = iv;
		token.encrypted = encrypted;
		callback(token);

	});
}

var crypt = {
	encrypt: encrypt,
	decrypt: decrypt,
	createPassKey: createPassKey
}

module.exports = crypt