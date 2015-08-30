var child_processes = require('child_process');
var os = require('os');
var fs = require('fs');
var path = require('path');

var windows = (os.platform().match("^win") != null);
var mac = 'darwin';

// logs something if device contains a token
function logClaudeDevice(device) {
    fs.readdir(device, function(err, files) {
        if(!err) {
            files.forEach(function(file_name, index, array) {
                if(file_name == require('./global').tokenFileName &&
                   fs.statSync(path.join(device, require('./global').tokenFileName)).isFile() )
                    console.log(device,'contains a token.');
            });
        }
    });
}

function registerClaudeDevice(device) {
    fs.readdir(device, function(err, files) {
        if(!err) {
            files.forEach(function(filename, index, array) {
                if(filename == require('./global').tokenFileName) {
                    fs.readFile(path.join(device, filename), function(err, buf) {
                        if(!err) {
                            var repoTable = require('./global').repoTable;
                            var existingRepo = false;
                            
                            for(var i = 0; i < repoTable.length; i++)
                            {
                                if(repoTable[i].token.equals(buf)) {
                                    repoTable[i].remotePath = device;
                                    existingRepo = true;
                                }
                            }
                            if(!existingRepo)
                                repoTable.push({localPath:'',remotePath:device,token:buf});
                        }
                    });
                }
            });
        }
    });
}

// Executes checkDevice on every drive listed by the system (hard drive, USB drives, ...)
function parseDevices(checkDevice)
{
    if(windows) {
        child_processes.exec('wmic logicaldisk get name', function(err, stdout, stderr)
        {
            array = stdout.split("\r\r\n");
            volumes = array.slice(1, array.length-2);
            volumes.forEach(function(o,i,a) {
                checkDevice(o.trim());
            });
        });
    } else if (os.platform() === mac) {
        console.log('mac process');
        var volumes = fs.readdirSync('/Volumes/');
        volumes.forEach(function(o,i,a) {
            console.log('check device', o);
            checkDevice('/Volumes/' + o);
        });
    } else {
        console.log('linux process');
    }
}

// parse the devices every once in a while, and execute checkDevice on them
function detectDevices(checkDevice) {
    parseDevices(checkDevice);
    setTimeout(function() {
            detectDevices(checkDevice);
        }, 500);
}

var devices = {
    logClaudeDevice: logClaudeDevice,
    detectDevices: detectDevices,
    registerClaudeDevice: registerClaudeDevice
};

module.exports = devices;