const multiInfo = document.getElementById("multiInfo")
const roomSet = document.getElementById("roomSet")
roomSet.style.display = "none"
var multiplayer = false
var gameCode
var host = false

const URL = "/";
const socket = io(URL, { autoConnect: false });

roomTimeSet(true)

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
    gameCode = code
    enableMulti()
});

socket.on('dumpBack', function(info) {
    console.log(info)
})

socket.on('joinFail', function(code, reason) {
    console.log('failed to join game '+code+'; '+reason)
})

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
    host = true
    roomSetToggle()
}

function enableMulti() {
    multiToggle()
    Array.from(document.getElementsByClassName("multiShow")).forEach(element => {
        element.style.display = "block"
    });
    Array.from(document.getElementsByClassName("multiHide")).forEach(element => {
        element.style.display = "none"
    });
    multiInfo.children[0].innerHTML = "Game " + gameCode
}

function multiLeave() {
    Array.from(document.getElementsByClassName("multiShow")).forEach(element => {
        element.style.display = "none"
    });
    Array.from(document.getElementsByClassName("multiHide")).forEach(element => {
        element.style.display = "block"
    });
    socket.disconnect()
}

function roomSetToggle() {
    if(roomSet.style.display == "none" ){
        roomSet.style.display = "block"
    } else {
        roomSet.style.display = "none"
    }
}

function roomTimeSet(count) {
    document.getElementById("roomTime").parentElement.children[1].disabled = !count
    document.getElementById("roomAmount").parentElement.children[1].disabled = count
}
document.getElementById("roomTime").checked = true