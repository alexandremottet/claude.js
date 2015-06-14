var fs = require('fs');
var os = require('os');
var child_processes = require('child_process');

var windows = (os.platform().match("^win") != null);
var mac = 'darwin';

function sync(device)
{
    console.log("coucou " + device); 
    tokenFound = true;
}

function parseToken(device, callback) {
    console.log(device);
    var files = fs.readdirSync(device+'/');
    files.forEach(function(file_name, index, array) {
        if(file_name == 'autosync-token' && fs.statSync(device+'/autosync-token').isFile() )
        {
            callback(device);
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
                checkDevice(o.trim())
            });
            callback();
        });
    } else if (os.platform() === mac) {
        console.log('mac process');
        var volumes = fs.readdirSync('/Volumes/');
        volumes.forEach(function(o,i,a) {
            console.log('check device', o);
            checkDevice('/Volumes/' + o)
        });
        callback();
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

detectDevices(function (device){
    parseToken(device, sync);
});



