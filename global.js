    
function defaultCallback(status) {
    console.log("Status:", status);
}

var global = {
    algorithm: 'aes-256-cbc',
    IVlength: 16,
    keyLength: 32,
    saltLength: 32,
    
    tokenFileName: '.autosync-token',
    lockFileName: '.lock',
    
    defaultCallback: defaultCallback
};

module.exports = global