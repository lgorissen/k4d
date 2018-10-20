var http = require('http');
var os = require('os');

console.log('Terra10 Transporter Server ' + process.env.TRANSPORTER_PLATFORM + ' is starting...');

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, transporter ' + process.env.TRANSPORTER_PLATFORM + ' will transport you in ' + process.argv[2] + ' seconds \n');
}).listen(8096);

console.log('Terra10 Transporter Server ' + process.env.TRANSPORTER_PLATFORM + ' started');
