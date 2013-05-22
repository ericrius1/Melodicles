var http = require('http');
var io = require('socket.io');
var url = require("url");
var path = require("path");
var fs = require("fs")

var port = 8080;

var app = http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname,
    filename = path.join(process.cwd(), uri);
  var contentTypesByExtension = {
    '.html': "text/html",
    '.css': "text/css",
    '.js': "text/javascript"
  };

  path.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {
        "Content-Type": "text/plain"
      })
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if (err) {
        response.writeHead(500, {
          "Content-Type": "text/plain"
        });
        response.write(ee + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) {
        headers["Content-Type"] = contentType;
      }
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
});


//WHY IS THIS NOT WORKING AND SOCKET IS UNDEFINED?*****
io.listen(port);
app.listen(port);



console.log(io.sockets);

io.sockets.on('connection', function(socket) {
  var ip = socket.handshake.address.address

  //send welcome message
  socket.emit('welcome', {
    message: "Welcome to Melodicles"
  });



});