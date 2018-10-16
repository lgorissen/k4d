var http = require('http');
var os = require('os');
var url = require('url');
var fs = require('fs');

console.log("Terra10 Transporter Server is starting...");

http.createServer(function (request, response) {
    var url_parts = url.parse(request.url, true).query;
    var name = url_parts.name;
    var from = url_parts.from;
    var to = url_parts.to;
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, ' + name + ' will be transported from ' + from + ' to ' + to + ' using the Terra10 transporter service\n');
    fs.appendFile('/tmp/transporter.log' , name + ' is transported from ' + from + ' to ' + to + '\n' );
}).listen(8090);

console.log('Terra10 Transporter Server started');
