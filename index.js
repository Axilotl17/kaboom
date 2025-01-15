const express = require('express');
const fs = require('node:fs')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// set up static content
app.use(express.static('public'))

// last known count
let count = 0

// Main page
app.get('/', async(req, res) => {
  // increment counter in counter.txt file
  try {
    count = parseInt(fs.readFileSync('counter.txt', 'utf-8')) + 1
  } catch {
    count = 1
  }

  fs.writeFileSync('counter.txt', count.toString())

  // render HTML response
  try {
    const content = fs.readFileSync('views/index.tmpl', 'utf-8')
      .replace('@@COUNT@@', count.toString())
    res.set('Content-Type', 'text/html')
    res.send(content)
  } catch (error) {
    res.send()
  }
})

//establishing connection w/ client
io.on('connection', (socket) => {

    //log connection
    console.log('a user connected');

    socket.on('disconnect', () => {
        //log disconnection
        console.log('user disconnected');
    });


    //testing functions

    // // log every event
    // socket.onAny((event, ...args) => {
    //     console.log(event, args);
    // });

    // global ping
    socket.on('ping', msg => {
        io.emit('ping', msg) 
    });

    // data dump
    socket.on('dump', function(){
        //[all rooms]
        io.to(socket.id).emit('dumpBack', [realRooms(), Array.from(socket.rooms).splice(-1,1)])
    })

    //when game is created
    socket.on('newGame', function (){
        //create room code
        newRoom = roomCode()
        //repeat if already taken
        while(realRooms().includes(newRoom)){
            newRoom = roomCode()
        }
        //join new room
        socket.join(newRoom)
        io.to(socket.id).emit('joinedGame', newRoom)
    })

    //when client tries to join game
    socket.on('joinGame', code => {
        if(realRooms().includes(code)){
            //success
            socket.join(code)
            io.to(socket.id).emit('joinedGame', code)
        } else {
            //failure
            io.to(socket.id).emit('joinFail', code, 'room does not exist')
        }
    })
});

//listen to port
server.listen(3000, () => {
    console.log('listening on *:3000');
});

//generate room code
function roomCode() {
    code = ""
    length = 4
    for(i=0; i<length; i++){
        code += String.fromCharCode((Math.floor(Math.random() * 26) + 65))
    }
    return code
}

//list of rooms + current room
function realRooms() {
    return Array.from(io.sockets.adapter.rooms.keys()).filter(key => key.length <= 4)
}