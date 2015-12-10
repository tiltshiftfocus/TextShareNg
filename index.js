var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database('messages.sqlite');
var fs = require('fs');

var currentMessages = [];

if(!fs.existsSync('messages.sqlite')){
	db.serialize(function() {
		db.run('CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, msg TEXT)');
	});
}

app.use('/', express.static(__dirname + '/js'))
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	currentMessages = [];
	db.each("SELECT rowid AS id, msg FROM messages ORDER BY id DESC",
		function(err, row){
		currentMessages.push({"id": row.id, "msg": row.msg});
	},
		function(){
			socket.emit('dbmsg', currentMessages);
		});


	socket.on('chat message', function(msg){
		var stmt = db.prepare("Insert INTO messages (msg) VALUES (?)", function(){
			db.get("SELECT id FROM messages ORDER BY id DESC LIMIT 1", function(err, row){
				io.emit('chat message', msg, row.id);
				currentMessages.unshift({"id": row.id, "msg": msg});
			});

		});
		stmt.run(msg);
		stmt.finalize();
	});

	socket.on('delete message', function(id){
		var stmt = db.prepare("DELETE FROM messages WHERE ID = (?)", function(){
			var i = currentMessages.length;
			while(i--){
			    if(currentMessages[i].id == id){
			        currentMessages.splice(i,1);
			    }
			}

			io.emit('update message', currentMessages);
		});
		stmt.run(id);
		stmt.finalize();
	});
});

var portNum = 9002;

http.listen(portNum, function(){
	console.log('listening on *:'+portNum);
});
