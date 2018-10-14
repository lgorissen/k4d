var http = require('http');
var os = require('os');

console.log("Terra10 HelloWorld Server is starting...");

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, you landed on Terra10 and host ' + os.hostname() + ' welcomes you!\n');
}).listen(8080);

console.log('Terra10 HelloWorld Server started');
