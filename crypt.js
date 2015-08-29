var crypto = require('crypto')
var fs = require('fs')
var algorithm = require('./global').algorithm;

function encrypt(text,iv,key) {
    cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAutoPadding(true);
    ciphertext = [];
    ciphertext[0] = cipher.update(text);
    ciphertext[1] = cipher.final();
    return Buffer.concat(ciphertext);
}

function decrypt(text,iv,key) {
    decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(true);
    cleartext = [];
    cleartext[0] = decipher.update(text);
    cleartext[1] = decipher.final();   
    return Buffer.concat(cleartext);
}

// encryptFile(string, Buffer(IVlength), Buffer(keyLength), function(err) {...})
function encryptFile(filename,iv,key,cb) {
    fs.readFile(filename, function(err, data) {
        if(err) cb(err);
        else fs.writeFile(filename, encrypt(data, iv, key), cb);
    });
}

// decryptFile(string, Buffer(IVlength), Buffer(keyLength), function(err) {...}) 
function decryptFile(filename, iv, key, cb) {
    fs.readFile(filename, function(err, data) {
        if(err) cb(err);
        else {
            try {
                ciphertext = decrypt(data, iv, key);
                fs.writeFile(filename, ciphertext, cb);
            } catch(err) {
                console.log('Problem while deciphering', filename);
            }
        }
    });
}

// decryptAndRead(string, Buffer(IVlength), Buffer(keyLength), function(err, cleartext) {...})
function decryptAndRead(filename, iv, key, cb) {
    decryptFile(filename, iv, key, function(err) {
        if(err) cb(err, null);
        else fs.readFile(filename, cb);
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