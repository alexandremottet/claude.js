var fs = require('fs');
var os = require('os');
var child_processes = require('child_process');

var windows = (os.platform().match("^win") != null);

function sync(device)
{
    console.log("coucou " + device); 
    tokenFound = true;
}

function parseToken(device, callback) {
    console.log(device);
    var files = fs.readdirsync(device+'/');
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
    } else {
        console.log('process');
        callback();
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

detectDevices(function parseToken(device){
    parseToken(device, sync);
});



