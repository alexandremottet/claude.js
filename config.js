var randtoken = require('rand-token');
var fs = require('fs');
var crypto = require('crypto');
var exec = require('child_process').exec;
var token = require('./token')

var algorithm = 'aes-256-gcm';
var iv = randomValueHex(12);

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
}

function checkVolume(volume) {

    stats = fs.statSync('/Volumes/'+volume);
    if (stats.isDirectory()) {
	console.log(volume + ' is a directory');
	return true;
    }
    return false;

}

function createGit(path) {

  process.chdir(path);
  exec('git init --bare', function (error, stdout, stderr) {
    console.log('git initialized : ' + stdout);
  });

}

function register(volume, password) {

  token.generate('/Volumes/'+volume, password, function() {
    createGit('/Volumes/'+volume);
  });

  //var uid = require('rand-token').uid;
  //var encryptedToken = {};
  //var token = 'claude.js';

  /*console.log('token', token);

  var cipher = crypto.createCipheriv(algorithm, password, iv);
  var encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  console.log('generate token ' + encrypted + ' for volume ' + volume);

  encryptedToken['token'] = iv+"."+encrypted;

  console.log(encryptedToken, JSON.stringify(encryptedToken));
  
  var exist = checkVolume(volume);
  if (exist) {
    fs.writeFile('/Volumes/'+volume+'/autosync-token', JSON.stringify(encryptedToken), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + '/Volumes/'+volume+'/autosync-token');
        createGit('/Volumes/'+volume);
      }
    }); 
  }*/

}

var config = {
  register: register,
}

module.exports = config

