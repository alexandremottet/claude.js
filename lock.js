var crypto = require('crypto')
var fs = require('fs');
var path = require('path');
var nodedir = require('node-dir');

var encryptFile = require('./crypt').encryptFile;
var decryptAndRead = require('./crypt').decryptAndRead;

var global = require('./global');


function lockRepository(repoPath, passwd) {
    crypto.randomBytes(global.IVlength+global.saltLength, function(err, saltandiv) {
        if(err)
        {
            console.log('Not enough entropy, cannot encrypt.');
            return;
        }
        iv = saltandiv.slice(0, global.IVLength);
        salt = saltandiv.slice(global.IVLength);
        
        // Generate key for AES256 (keylength = 256 bits = 32 bytes)
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }
            
            nodedir.files(repoPath, function(err, fileList) {
                fileList.forEach(function(fileName, index, array) {
                    console.log('Ciphering', fileName);
                    encryptFile(fileName, iv, key, global.defaultErrCallback);
                });
            });
            
            fs.writeFile(path.join(repoPath, global.lockFileName), saltandiv);
        });
    });
}

function unlockRepository(repoPath, passwd) {
    fs.readFile(path.join(repoPath,lockFileName), function(err,data){
        iv = data.slice(0,global.IVlength);
        salt = data.slice(global.IVlength);
        
        crypto.pbkdf2(passwd, salt, 4096, global.keyLength, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }
            
            // Uncipher the token, read the token, find which
            // local repo corresponds to the token
            decryptAndRead(path.join(repoPath, global.tokenFileName), function(err, data) {
                // TODO: check this is a good token
                
                // Decipher every file but .lock
                nodedir.files(repoPath, function(err, fileList) {
                    if(err) console.log(err);
                    fileList.forEach(function(fileName, index, array) {
                        if(fileName == path.join(repoPath, global.lockFileName)) {
                            fs.unlink(fileName);
                        }
                        else {
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