var app = require('http').createServer(handler)
var io = require('socket.io').listen(app);

var port = 8080;
var ip = "127.0.0.1";
app.listen(port, ip);
console.log("server at http://" + ip + ":" + port);

function handler(request, response){
  //Dump out a basic server status page
  var data = '<!doctype html><head><title>DuneBuggy Server</title></head><body>';
  
  data += '<h1>DuneBuggy Server</h1>';
 
  
  response.writeHead(200);
  response.end(data);
}

io.socket.on('connection', function (socket){
  var ip = socket.handshake.address.address
  console.('Client connected from' + ip + ' ...');

  //send welcome message
  socket.emit('welcome', {
    message: "Welcome to Melodicles"
  });

  //Set up Message handlers

});

