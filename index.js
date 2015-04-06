var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var nameSpace = io.of('/');

nameSpace.on('connection', function(socket){
  socket.emit("server message", { titleMessage: "Welcome to GeoChat!" });
  
  //send room count to all clients
  nameSpace.emit('updateRoomCount', {onlineCount: io.engine.clientsCount});

  socket.on('join room', function(msg){
    console.log('joining room: ' + msg);
	for(var room in io.sockets.adapter.rooms){
		console.log('rooms: ' + room);
		socket.leave(room);
	}
    socket.join(msg);
  });
  
  socket.on('chat message', function(roomname, msg){
    console.log('emitting: ' + msg + " to roomname: " + roomname);
    //nameSpace.emit('chat message', msg);
	io.to(roomname).emit('chat message', msg);
  });
  
  //When Disconnecting
  socket.on("disconnect", function() {
	console.log('user disconnected');
	//send room count to all
	nameSpace.emit('updateRoomCount', {onlineCount: io.engine.clientsCount});
  });
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});