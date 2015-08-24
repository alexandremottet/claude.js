var fs = require('fs');
var exec = require('child_process').exec;
var token = require('./token')
var Git = require('nodegit');
var path = require('path');

function checkVolume(volumePath, cb) {
    stats = fs.statSync(volumePath);
    if (stats.isDirectory()) {
	   console.log(volumePath + ' is a directory.');
        
        fs.open(path.join(volumePath, '/.autosync-token'), 'r', function(err,fd) {
            if(fd != 0)
            {
                console.log(volumePath + ' is already a Claude-associated volume. Please wipe the volume if you really want to and try again.');
                cb(false);
            }
            else
                return true;
        });
    }
    return false;
}

function register(volumePath, localPath, cb) {
    nVolumePath = path.resolve(volumePath);
    nLocalPath = path.resolve(localPath);
    // need to check if volumePath points to an empty directory
    // need to check if localPath points to a nonexisting directory
    console.log('Starting creation...');
    Git.Repository.init(nVolumePath, 1).then( function(repo) {
        console.log('Repository created in', nVolumePath);
        Git.Clone(nVolumePath, nLocalPath).then( function(repo) {
            console.log('Local copy created in', nLocalPath);
            token.generate(nVolumePath, nLocalPath, cb);
        });
    }).catch(function(err) {
        cb(err);
    });
}

var config = {
  register: register,
}

module.exports = config

