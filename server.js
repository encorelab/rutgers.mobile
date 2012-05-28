var sail = require('./js/node.server.js');

var msg = "Starting Rutgers COAST server...";
var div = Array(msg.length+1).join("*");
console.log("\n"+div+"\n"+msg+"\n"+div);
sail.server.start(8000);