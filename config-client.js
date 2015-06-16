var readline = require('readline');
var config = require('./config');
var crypt = require('./crypt');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Type a volume to register. ", function(volume) {
  rl.question("Type your password. ", function(pass) {

    crypt.createPassKey(pass, function(key) {
       
       config.register(volume, key.toString('hex'));
       rl.close();

    });   

  })
});