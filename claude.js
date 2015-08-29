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


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt('Claude: ');
rl.prompt(true);

rl.on('line', function(cmd) {
    array = cmd.split(' ');
    switch(array[0])
    {
    case 'list':
        parseDevices(isDeviceClaudeEnabled, function(err, dev) {
            if(dev)
                console.log(dev, 'contains a Claude repository.'); 
        });
        break;
    case 'add':
        rl.question("Type a volume to register. ", function(volumePath) {
            rl.question("Type the associated local repository. ", function(localRepo) {
                config.register(volumePath, localRepo, require('./global').defaultCallback);
            });   
        });
        break;
            
    case 'lock':
        if(array.length == 3)
        {
            // TODO: sync local repo to remote
            lock.lockRepository(array[1], array[2]);
        }
        else
            console.log('That\'s not how to use lock you dumbass.');
        break;
            
    case 'unlock':
        if(array.length == 3)
            lock.unlockRepository(array[1], array[2]);
        else
            console.log('That\'s not how to use unlock you dumbass.');
        break;
            
    case 'quit':
        rl.close();
        process.exit(0);
        break;
    case '':
        break;
    default:
        console.log('I don\'t know this command.');
    }    
    rl.prompt(true);
});
    