var crypto = require('crypto')
var fs = require('fs');
var path = require('path');
var nodedir = require('node-dir');

var IVlength = 16;
var saltLength = 32;
var algorithm = 'aes-256-cbc';

function lockRepository(repoPath, passwd) {
    crypto.randomBytes(IVlength+saltLength, function(err, saltandiv) {
        if(err)
        {
            console.log('Not enough entropy, cannot encrypt.');
            return;
        }
        iv = saltandiv.slice(0, IVLength);
        salt = saltandiv.slice(IVLength);
        
        // Generate key for AES256 (keylength = 256 bits = 32 bytes)
        crypto.pbkdf2(passwd, salt, 4096, 32, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }
            
            // Cipher every file but .autosync-token
            nodedir.files(repoPath, function(err, fileList) {
                fileList.forEach(function(fileName, index, array) {
                    if(fileName != path.join(repoPath,'.autosync-token')) {
                        console.log('Ciphering', fileName);
                        fs.readFile(fileName, function(err, data) {
                            cipher = crypto.createCipheriv(algorithm, key, iv);
                            
                            ciphertext = [];
                            ciphertext[0] = cipher.update(data);
                            ciphertext[1] = cipher.final();
                            fs.writeFile(fileName, Buffer.concat(ciphertext)); 
                        });
                    }
                });
            });
            
            fs.writeFile(path.join(repoPath,'.lock'), saltandiv);
        });
    });
}

function unlockRepository(repoPath, passwd) {
    fs.readFile(path.join(repoPath,'.lock'), function(err,data){
        iv = data.slice(0,IVlength);
        salt = data.slice(IVlength);
        
        crypto.pbkdf2(passwd, salt, 4096, 32, 'sha1', function(err, key) {
            if(err)
            {
                console.log('Problem during PBKDF2.');
                return;
            }
            
            // Decipher every file but .autosync-token
            nodedir.files(repoPath, function(err, fileList) {
                if(err) console.log(err);
                fileList.forEach(function(fileName, index, array) {
                    if(fileName == path.join(repoPath, '.lock')) {
                        fs.unlink(fileName);
                    }
                    else if(fileName != path.join(repoPath, '.autosync-token')) {
                        console.log('Deciphering', fileName);
                        fs.readFile(fileName, function(err, data) {
                            decipher = crypto.createDecipheriv(algorithm, key, iv);
                            cleartext = [];
                            cleartext[0] = decipher.update(data);
                            cleartext[1] = decipher.final();
                            fs.writeFile(fileName, Buffer.concat(cleartext)); 
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

modules.exports = lock