
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var db;

// connect to mongo db
var mongo_client = require('mongodb').MongoClient, assert = require('assert');
var url = 'mongodb://localhost:7810/shareboard' 
mongo_client.connect(url, function(err, database){
 	assert.equal(null, err);
	console.log("connected successfully to server");

	db = database;
});

// request routers
app.get('/', function(request, response){
	response.sendFile('/home/ifan/node_server/fishball/index.html');
	var path = url.parse(request.url).pathname;
	console.log(path);
});

app.get('/private_get', function(req, res){
	req_room_id = parseInt(req.query.room_id);
	var col = db.collection('rooms');
	//console.log("room_id:%s", req_room_id);
	//res.send("server get room_id success!");
	col.find({'room_id':req_room_id}).toArray(function(err, docs){
		assert.equal(null, err);	
		console.log(docs);
		if(docs.length == 0){
			console.log("no room_id:", req_room_id);	
			res.send("no current room_id");			
		}else{
			res.sendFile('/home/ifan/node_server/fishball/index.html');
		}
	});	
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
	var col = db.collection('rooms');
	
	col.find().sort({'room_id':-1}).toArray(function(err, docs){
		assert.equal(err, null);	
		console.log("found the following result");
		res.send("generate a room_id");	
		
		// get the top room id
		var current_rm_id = docs[0]['room_id'];
		console.log("current rm_id: ", current_rm_id);

		// insert a new room id
		col.insert({'room_id': current_rm_id + 1}, function(err, result){
			assert.equal(null, err);
			console.log("insert new room_id: ", result);
		});
	});
	
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
