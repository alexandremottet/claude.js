var app = require('app');
var Menu = require('menu');
var Tray = require('tray');

var appIcon = null;
app.on('ready', function(){
  appIcon = new Tray('tray.png');
  var contextMenu = Menu.buildFromTemplate([
    { label: 'lock', type: 'radio', checked: false },
    { label: 'unlock', type: 'radio', checked: false },
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
});