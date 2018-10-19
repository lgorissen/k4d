var http = require('http');
var os = require('os');
var fs = require('fs');

console.log("Terra10 gitRepo server is starting...");


var walkSync = function(dir, filelist) {

    if( dir[dir.length-1] != '/') dir=dir.concat('/')

    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
        } else {
            filelist.push(dir+file);
        }
    });
    return filelist;
};


http.createServer(function (request, response) {

        const filePath =  "/tmp/gitRepo";

        // Check if file specified by the filePath exists 
        fs.exists(filePath, function(exists){
            if (exists) {  

                response.writeHead(200, {
                    "Content-Type": "text/plain",
                });
                response.end('Directory listing of gitRepo : \n' + walkSync(filePath,[]).join("\n") );
            } else {
                response.writeHead(400, {"Content-Type": "text/plain"});
                response.end("ERROR File does not exist");
            }
        });
}).listen(8094);

console.log('Terra10 gitRepo server started');
