var app = require('http').createServer(handler);
var url = require("url");
var path = require("path");
var fs = require("fs")
var Firebase = require('firebase');

var port = 8080;


function handler(request, response) {
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

    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }

    fs.readFile(filename, "binary", function(err, file) {
      if (err) {
        response.writeHead(500, {
          "Content-Type": "text/plain"
        });
        response.write(err + "\n");
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
};

var myRootRef = new Firebase('http://particles.firebaseIO.com/');
app.listen(port)
console.log("listening at http://" + '127.0.0.1:' + port);
console.log("modules ", Object.keys(require('module')._cache));

