var child = require('child_process').execFile;
var os = require('os');
var myfuncs = {
    openApp : function (appToOpen,argToSend, lastchild=null){
                    return  child(appToOpen, [argToSend],function(err, data) {
                        console.log(err)
                        console.log(data.toString());
                        })
              
                 
            },
    getIP : function(){
        //https://stackoverflow.com/questions/10750303/how-can-i-get-the-local-ip-address-in-node-js
                var interfaces = os.networkInterfaces();
                var addresses = [];
                for (var k in interfaces) {
                    for (var k2 in interfaces[k]) {
                        var address = interfaces[k][k2];
                        if (address.family === 'IPv4' && !address.internal) {
                            addresses.push(address.address);
                        }
                    }
                }
                return addresses;
            }


        }
        module.exports = myfuncs