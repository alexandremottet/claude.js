var fs = require('fs');
var os = require('os');
var child_processes = require('child_process');
var readline = require('readline');
var path = require('path');
var config = require('./config');
var lock = require('./lock');

var tokenFileName = require('./global').tokenFileName;
var windows = (os.platform().match("^win") != null);
var mac = 'darwin';

function sync(device)
{
    console.log("coucou " + device); 
    tokenFound = true;
}

function isDeviceClaudeEnabled(device, callback) {
    fs.readdir(device, function(err, files) {
        if(err) callback(err, null);
        else {
            files.forEach(function(file_name, index, array) {
                if(file_name == tokenFileName && fs.statSync(path.join(device, tokenFileName)).isFile() )
                {
                    callback(null, device);
                }
            });
            callback(device + ' is not Claude-enabled', null);
        }
    });
}

function parseDevices(checkDevice, callback)
{
    if(windows) {
        child_processes.exec('wmic logicaldisk get name', function(err, stdout, stderr)
        {
            array = stdout.split("\r\r\n");
            volumes = array.slice(1, array.length-2);
            volumes.forEach(function(o,i,a) {
                checkDevice(o.trim(), callback);
            });
        });
    } else if (os.platform() === mac) {
        console.log('mac process');
        var volumes = fs.readdirSync('/Volumes/');
        volumes.forEach(function(o,i,a) {
            console.log('check device', o);
            checkDevice('/Volumes/' + o, callback);
        });
    } else {
        console.log('linux process');
    }
}

var tokenFound = false;
function detectDevices(checkDevice) {
    parseDevices(checkDevice, function parseDeviceCallback() {
        if(!tokenFound) {
            console.log('token not found');
            setTimeout(function() {
                detectDevices(checkDevice);
            }, 500);   
        }
    });
}

//detectDevices(function (device){
//    parseToken(device, sync);
//});

function cmdList(arg) {
    if(arg[0] == 'devices')
    {
        parseDevices(isDeviceClaudeEnabled, function(err, dev) {
                if(dev)
                    console.log(dev, 'contains a Claude repository.'); 
            });
    }
    else if(arg[0] == 'local')
        console.log(require('./global').repoTable);   
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
    var repoEntry = require('./global').repoTable[args[0]];
       
    lock.lockRepository(repoEntry.remotePath, args[1], function(err) {
        if(err) console.log(err);
        else {
            require('./global').rmdirRecursive(repoEntry.localPath, function(err) {
                if(err) {
                    console.log('Cannot remove',repoEntry.localPath);
                    console.log(err);
                } else {
                    repoEntry.localPath = '';
                    repoEntry.remotePath = '';
                }
            });
        }
    });
}

function cmdUnlock(args) {
    lock.unlockRepository(args[0], args[1]);   
}

function cmdQuit(arg) {
    fs.writeFileSync('.claude', JSON.stringify(require('./global').repoTable));
    process.exit(0);
}

require('./global').readConfigFile();

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('Claude: ');
rl.prompt(true);

// 'command': [#arguments, function(arguments) {...}, '<cmd> <arg1> <arg2> ...']
commands = {
    'list': [1, cmdList, 'list (devices|local)'],
    'add': [0, cmdAdd, 'add'],
    '': [0, function(a){}, ''],
    'lock': [2, cmdLock, 'lock <local repository> <password>'],
    'unlock': [2, cmdUnlock, 'unlock <local repository> <password>'],
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
    