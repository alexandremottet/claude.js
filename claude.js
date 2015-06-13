var fs = require('fs');
var os = require('os');
var child_processes = require('child_process');

var windows = (os.platform().match("^win") != null);

function sync(device)
{
    console.log("coucou " + device); 
    tokenFound = true;
}

function parseToken(device, callback)
{
    console.log(device);
    fs.readdir(device+'/', function(err,files) {
        if(err == null)
        {
            files.forEach(function(file_name, index, array) {
                if(file_name == 'autosync-token' && fs.statSync(device+'/autosync-token').isFile() )
                {
                    callback(device);
                }
            });
        }
    });
}

function parseDevices(callback)
{
    if(windows)
    {
        child_processes.exec('wmic logicaldisk get name', function(err, stdout, stderr)
        {
            array = stdout.split("\r\r\n");
            volumes = array.slice(1, array.length-2);
            volumes.forEach(function(o,i,a) {
                callback(o.trim())
            });
        });
    }
}

var tokenFound = false;
function detectDevices(callback)
{
    parseDevices(callback);
    if(!tokenFound)
    {
        setTimeout(detectDevices(callback), 2000);   
    }
}

detectDevices(function(device){ parseToken(device, sync) });



