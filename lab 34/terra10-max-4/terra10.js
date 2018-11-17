var http = require('http');
var os = require('os');

var landingCount=0;

console.log("Terra10 (version r2) HelloWorld Server is starting...");

http.createServer(function (request, response) {
    landingCount++;
    if ( landingCount > 4 )  {
        response.writeHead(500);
        response.end('Something went wrong in your landing - this landing platform is malfunctioning: ' + os.hostname() + '\n');
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Hello, you landed on Terra10 (version r2) and host ' + os.hostname() + ' welcomes you!\n');
    }
}).listen(8080);

console.log('Terra10 (version r2) HelloWorld Server started');
