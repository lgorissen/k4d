var http = require('http');
var os = require('os');

console.log("Terra10 HelloWorld Server is starting...");

var landingCount = 0;

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    console.log("Received request from " + request.connection.remoteAddress);
    landingCount++;
    if ( (landingCount / 10) %2 < 1)  {
        response.writeHead(500);
        response.end('Something went wrong in your landing - this landing platform is malfunctioning: ' + os.hostname() + '\n');
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello, you landed on Terra10 and host ' + os.hostname() + ' welcomes you!\n');
    }
    return;
}).listen(8080);

console.log('Terra10 HelloWorld Server started');

