const URL = "/";
const socket = io(URL, { autoConnect: false });

//emit to server
function ping(msg) {
    socket.emit('ping', msg);
}

//when recieved from server
socket.on('ping', function(msg) {
    console.warn("recieved: " + msg)
});

//on game join
socket.on('joinedGame', function(code) {
    console.warn("joined game "+code)
});

socket.on('dumpBack', function(info) {
    console.log(info)
})

socket.on('joinFail', function(code, reason) {
    console.log('failed to join game '+code+'; '+reason)
})

// if(gameCode.value.length == 4) {
//     socket.connect(); 
//     socket.emit('joinGame', gameCode.value)
// } else {
//     console.log("not 4 characters")
// }

function joinGame() {
    code = document.getElementById("codeInput").value
    if(code.length == 4) {
        socket.connect(); 
        socket.emit('joinGame', code)
    } else {
        console.log("not 4 characters")
    }
}

function newGame() {
    socket.connect(); 
    socket.emit('newGame')
}