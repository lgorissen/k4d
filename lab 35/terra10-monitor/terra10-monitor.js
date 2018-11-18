var http = require('http');
var os = require('os');
var fs = require('fs');

console.log("Terra10 Transporter Server is starting...");

http.createServer(function (request, response) {

        const filePath =  "/var/log/transporter.log";

        // Check if file specified by the filePath exists 
        fs.exists(filePath, function(exists){
            if (exists) {     
                response.writeHead(200, {
                    "Content-Type": "text/plain",
                    "Content-Disposition": "attachment; filename=transporter.log"
                });
                fs.createReadStream(filePath).pipe(response);
            } else {
                response.writeHead(400, {"Content-Type": "text/plain"});
                response.end("ERROR File does not exist");
            }
        });
}).listen(8092);

console.log('Terra10 monitor started');
