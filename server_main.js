
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');

app.get('/', function(request, response){
	response.sendFile('/home/ifan/node_server/fishball/index.html');
	var path = url.parse(request.url).pathname;
	console.log(path);
});

app.get('/private_get', function(req, res){
	//room_id = req.query.room_id;
	//console.log("room_id:%s", room_id);
	//res.send("server get room_id success!");
	res.sendFile('/home/ifan/node_server/fishball/index.html');
});

// get web chat interface 
app.get('/chat_get', function(req, res){
	//room_id = req.query.room_id;
	//console.log("room_id:%s", room_id);
	//res.send("server get room_id success!");
	res.sendFile('/home/ifan/node_server/fishball/chat_index.html');
});


// generate room id
app.get('/gene_room_id', function(req, res){
 	res.send("generate a room_id");	
});

io.on('connection', function(socket){

	console.log('a user connected');

	socket.on('disconnect', function(){
		console.log('user disconnected');	
	});

	// first enter a channel
	socket.on('create', function(room_id){
		socket.join(room_id);
		console.log("server socket join room ", room_id);
	});

	// exit a channel
	socket.on('exit', function(room_id){
		socket.leave(room_id);
		console.log("server socket leave room ", room_id);
	});

	socket.on('chat message', function(msg){
    	console.log('message: ' + msg);
	    
		var msgobj = JSON.parse(msg);
		io.to(msgobj['room_id']).emit('chat message', msgobj['msg']);
	});

	
});

// server start
var port = 3003
http.listen(port, function(){
	console.log('listening on *:' + port);	
});
