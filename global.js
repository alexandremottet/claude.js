    
function defaultCallback(status) {
    if(status)
        console.log("Status:", status);
}

function readConfigFile() {
    require('fs').readFile('.claude', function(err, data) {
        if(!err) {
            var table = JSON.parse(data);
            for(var entry in table)
                repoTable[entry] = Buffer(table[entry].data);
        }
    });
}

var repoTable = {}

var global = {
    algorithm: 'aes-256-cbc',
    IVlength: 16,
    keyLength: 32,
    saltLength: 32,
    
    tokenFileName: '.autosync-token',
    lockFileName: '.lock',
    
    repoTable: repoTable,
    readConfigFile: readConfigFile,
    
    defaultCallback: defaultCallback
};

module.exports = global