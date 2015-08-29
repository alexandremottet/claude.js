var crypto = require('crypto')

var algorithm = require('./global').algorithm;

function encrypt(text,iv,key) {
     cipher = crypto.createCipheriv(algorithm, key, iv);

    ciphertext = [];
    ciphertext[0] = cipher.update(text);
    ciphertext[1] = cipher.final();
    return Buffer.concat(ciphertext);
}

function decrypt(text,iv,key) {
    decipher = crypto.createDecipheriv(algorithm, key, iv);
    cleartext = [];
    cleartext[0] = decipher.update(text);
    cleartext[1] = decipher.final();   
    return Buffer.concat(cleartext);
}

function encryptFile(filename,iv,key,cb) {
    fs.readFile(filename, function(err, data) {
        if(err) cb(err);
        fs.writeFile(filename, encrypt(data, iv, key), cb);
    });
}
                
function decryptFile(filename, iv, key, cb) {
    fs.readFile(filename, function(err, data) {
        if(err) cb(err);
        fs.writeFile(filename, decrypt(data, iv, key), cb);
    });
}

function decryptAndRead(filename, iv, key, cb) {
    decryptFile(filename, iv, key, function(err) {
        if(err) cb(err, null);
        fs.readFile(filename, cb);
    });   
}


var crypt = {
	encrypt: encrypt,
	decrypt: decrypt,
    encryptFile: encryptFile,
    decryptFile: decryptFile,
    decryptAndRead: decryptAndRead
}

module.exports = crypt