var fs = require('fs');
var readline = require('readline');
var path = require('path');
var config = require('./config');
var lock = require('./lock');
var Git = require('nodegit');

require('./devices').detectDevices(require('./devices').registerClaudeDevice);
require('./global').readConfigFile();

function cmdList(arg) {
    if(arg[0] == 'devices')
    {
        parseDevices(isDeviceClaudeEnabled, function(err, dev) {
            if(dev)
                console.log(dev, 'contains a Claude repository.'); 
        });
    }
    else if(arg[0] == 'repositories') {
        repoTable = require('./global').repoTable;
        for(var i = 0; i < repoTable.length; i++) {
            console.log('Repository',i,':', repoTable[i].localPath,',', repoTable[i].remotePath);   
        }
    }
}

function cmdAdd(arg) {
    rl.question("Type a volume to register. ", function(volumePath) {
        rl.question("Type the associated local repository. ", function(localRepo) {
            config.register(volumePath, localRepo, function(err) {
                if(err) console.log(err);
                else console.log('Everything went fine');
            });
        });   
    });
}

function cmdLock(args) {
    if(!require('./global').isStringValidRepositoryID(args[0])) {
        console.log(commands['lock'][2]);
        return;
    }
    var repoEntry = require('./global').repoTable[args[0]];
       
    lock.lockRepository(repoEntry.remotePath, args[1], function(err) {
        if(err) console.log(err);
        else {
            require('./global').rmdirRecursive(repoEntry.localPath, function(err) {
                if(err) {
                    console.log('Cannot remove',repoEntry.localPath);
                    console.log(err);
                }
            });
        }
    });
}

function cmdUnlock(args) {
    if(!require('./global').isStringValidRepositoryID(args[0])) {
        console.log(commands['unlock'][2]);
        return;
    }
    
    var repoEntry = require('./global').repoTable[args[0]];
    if(repoEntry.localPath == '') {
        rl.question('Where should I copy the repository?', function(ans) {
            repoEntry.localPath = ans;
        });
    }
        
    // uncipher the remote copy with the given password
    lock.unlockRepository(repoEntry.remotePath, args[1], function(err){
        if(err) {
            console.log('Cannot unlock',repoEntry.remotePath);
            console.log(err);
        }
        else 
            Git.Clone(repoEntry.remotePath, repoEntry.localPath);
    });   
}

function cmdQuit(arg) {
    fs.writeFileSync('.claude', JSON.stringify(require('./global').repoTable));
    process.exit(0);
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('Claude: ');
rl.prompt(true);

// 'command': [#arguments, function(arguments) {...}, '<cmd> <arg1> <arg2> ...']
var commands = {
    'list': [1, cmdList, 'list (devices|repositories)'],
    'add': [0, cmdAdd, 'add'],
    '': [0, function(a){}, ''],
    'lock': [2, cmdLock, 'lock <repository id> <password>'],
    'unlock': [2, cmdUnlock, 'unlock <repository id> <password>'],
    'quit': [0, cmdQuit, ''],
    'rmdir': [1, function(a){require('./global').rmdirRecursive(a[0], require('./global').defaultCallback);}, '']
};

rl.on('line', function(cmd) {
    array = cmd.trim().split(' ');
    var goodCommand = false;
    for(var cmd in commands)
    {
        if(cmd == array[0])
        {
            goodCommand = true;
            if(array.length-1 >= commands[cmd][0])
                commands[cmd][1](array.slice(1));
            else
                console.log('Usage:',commands[cmd][2]);
        }
    }
    if(!goodCommand)
        console.log(array[0],'is not a valid command.');
    rl.prompt(true);
});
    