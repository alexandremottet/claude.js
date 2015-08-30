var fs = require('fs');
var path = require('path');

function defaultCallback(status) {
    if(status)
        console.log("Status:", status);
}

function readConfigFile() {
    require('fs').readFile('.claude', function(err, data) {
        if(!err) {
            var table = JSON.parse(data);
            for(var i = 0; i<table.length; i++)
                repoTable.push({localPath: table[i].localPath,
                                remotePath: table[i].remotePath, 
                                token: Buffer(table[i].token)});
        }
    });
}


function rmdirRecursive(dirname,cb) {
    fs.readdir(dirname, function(err, fileList) {
        if(err) {
            cb(err);
            return;
        }
        var remainingFiles = fileList.length;
        // If the directory is empty just rmdir it
        if(remainingFiles == 0) fs.rmdir(dirname, cb);
        
        fileList.forEach(function(filename, index, array) {
            var fileStats = fs.statSync(path.join(dirname, filename));
            if(fileStats.isFile())
                fs.unlink(path.join(dirname,filename), function(err){
                    if(err) console.log('problem unlinking',  path.join(dirname,filename));
                    else if(--remainingFiles == 0) {
                        fs.rmdir(dirname, cb);
                    }
                });
            
            else if(fileStats.isDirectory())
            {
                rmdirRecursive(path.join(dirname,filename), function(err) {
                    if(err) console.log('problem unlinking',  path.join(dirname,filename));
                    else if(--remainingFiles == 0) {
                        fs.rmdir(dirname, cb);
                    }
                });
            }
        });
    });
}


var repoTable = []

var global = {
    algorithm: 'aes-256-cbc',
    IVlength: 16,
    keyLength: 32,
    saltLength: 32,
    
    tokenFileName: '.autosync-token',
    lockFileName: '.lock',
    
    repoTable: repoTable,
    readConfigFile: readConfigFile,
    
    defaultCallback: defaultCallback,
    rmdirRecursive: rmdirRecursive
};

module.exports = global