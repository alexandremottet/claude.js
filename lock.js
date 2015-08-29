var crypto = require('crypto')
var fs = require('fs');
var path = require('path');
var nodedir = require('node-dir');

var encryptFile = require('./crypt').encryptFile;
var decryptFile = require('./crypt').decryptFile;
var decryptAndRead = require('./crypt').decryptAndRead;

var global = require('./global');


function lockRepository(localPath, passwd) {
    crypto.randomBytes(global.IVlength+global.saltLength, function(err, saltandiv) {
        if(err)
        {
            console.log('Not enough entropy, cannot encrypt.');
            return;
        }
        iv = saltandiv.slice(0, global.IVlength);
        salt = saltandiv.slice(global.IVlength);
        
        // Generate key for AES256 (keylength = 256 bits = 32 bytes)
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }

            nodedir.files(localPath, function(err, fileList) {
                fileList.forEach(function(fileName, index, array) {
                    // Cipher everyfile except the ones in .git/ and the token
                    if(fileName.indexOf('.git')==-1 && path.basename(fileName) != global.tokenFileName) {
                        console.log('Ciphering', fileName);
                        encryptFile(fileName, iv, key, global.defaultCallback);
                    }
                });
            });
            
            fs.writeFile(path.join(localPath, global.lockFileName), saltandiv, global.defaultCallback);
        });
    });
}

function unlockRepository(localPath, passwd) {
    fs.readFile(path.join(localPath,global.lockFileName), function(err,data){
        iv = data.slice(0,global.IVlength);
        salt = data.slice(global.IVlength);
        
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }
            

            fs.unlink(path.join(localPath, global.lockFileName), function(err){
                // Decipher every file but the ones in .git/ and the token
                nodedir.files(localPath, function(err, fileList) {
                    if(err) console.log(err);
                    fileList.forEach(function(fileName, index, array) {
                        if(fileName.indexOf('.git')==-1 && path.basename(fileName) != global.tokenFileName) {
                            console.log('Deciphering', fileName);
                            decryptFile(fileName, iv, key, global.defaultCallback);
                        }
                    });
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