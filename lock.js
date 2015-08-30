var crypto = require('crypto')
var fs = require('fs');
var path = require('path');
var nodedir = require('node-dir');

var encryptFile = require('./crypt').encryptFile;
var decryptFile = require('./crypt').decryptFile;
var decryptAndRead = require('./crypt').decryptAndRead;

var global = require('./global');

// lockRepository(string, string, function(err) {...})
function lockRepository(repository, passwd, cb) {
    crypto.randomBytes(global.IVlength+global.saltLength, function(err, saltandiv) {
        if(err) {
            cb(err);
            return;
        }
        
        iv = saltandiv.slice(0, global.IVlength);
        salt = saltandiv.slice(global.IVlength);
        
        // Generate key for AES256 (keylength = 256 bits = 32 bytes)
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err) {
                cb(err);
                return;
            }

            nodedir.files(repository, function(err, fileList) {
                var nbRemainingFiles = fileList.length-1;
                
                fileList.forEach(function(fileName, index, array) {
                    // make each file writable (git makes the objects/ only readable)
                    fs.chmod(fileName, 0700, function(err){
                        if(err) {
                            cb(err);
                            return;
                        }
                        
                        // Cipher every file except the token
                        if(path.basename(fileName) != global.tokenFileName) {
                            console.log('Ciphering', fileName);
                            encryptFile(fileName, iv, key, function(err) {
                                if(err) cb(err);
                                // Done encrypting all the files
                                // Save the IV and salt in a file and call the callback
                                else if(--nbRemainingFiles == 0)
                                    fs.writeFile(path.join(repository, global.lockFileName), saltandiv, cb);
                            
                            });
                        }
                    });
                });
            });
        });
    });
}

// unlockRepository(string, string, function(err) {...})
/* repository: string that contains the path of the bare repository. It is assumed that
                this string belongs to global.repoTable                                 */
function unlockRepository(repository, passwd, cb) {
    fs.readFile(path.join(repository,global.lockFileName), function(err,data){
        iv = data.slice(0,global.IVlength);
        salt = data.slice(global.IVlength);
        
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err)
            {
                cb(err);
                return;
            }
            // Decipher every file but the token
            nodedir.files(repository, function(err, fileList) {
                var nbRemainingFiles = fileList.length-2;

                if(err) cb(err);
                fileList.forEach(function(fileName, index, array) {
                    // Decipher every file but the token
                    if(path.basename(fileName) != global.tokenFileName && path.basename(fileName) != global.lockFileName) {
                        console.log('Deciphering', fileName);
                        decryptFile(fileName, iv, key, function(err) {
                            if(err)
                                cb(err);
                            else if(--nbRemainingFiles == 0)
                                 fs.unlink(path.join(repository, global.lockFileName), cb);

                        });
                    }
                });
            });
        });
    });
}

var lock = {
    lockRepository: lockRepository,
    unlockRepository: unlockRepository
};

module.exports = lock