//html refs
const flagCounter = document.getElementById("flags")
const settings = document.getElementById("settings")
const multi = document.getElementById("multi")

//canvas setup
const gameBoard = document.getElementById("board")
const minefield = document.getElementById("minefield")
var ctx = minefield.getContext("2d")
const grid = document.getElementById("minefield")
var GDctx = grid.getContext("2d", {
    alpha: false
})
// const outcome = document.getElementById("outcome")
// var OCctx = outcome.getContext("2d", {
//     alpha: false
// })

var minefieldDim = (window.innerHeight-16)
resize()

//make global vars
var board = []
var stat = []
var mineCount
var dimension
var cursorX
var cursorY
var boxX
var boxY

//game setup
var game = "pre"
var firstClick = true
var flagCount = 0
var startTime = 0
var finalTime = 0
var updateTime

//fix minefield properties
minefield.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }
window.focus();

//set up settings
if(set['count']) {
    document.getElementById("count").checked = true
} else {
    document.getElementById("percent").checked = true
}
countSet(set['count'])
settings.style.display = "none"
multi.style.display = "none"

//draw favicon
favicon()

//prepare game
reset()

function resize() {
    minefieldDim = (window.innerHeight-16)
    Array.from(gameBoard.children).forEach(element => {
        element.style.height = minefieldDim.toString()+"px"
        element.style.width = minefieldDim.toString()+"px"
    });
    gameBoard.style.height = minefieldDim.toString()+"px"
    gameBoard.style.width = minefieldDim.toString()+"px"
}

//generates random numbers
function randNum(lim) {
    return Math.floor((Math.random()*lim))
}

//compares 2 lists, returns if same list
function compare(a, b) {
    return(a.length === b.length && a.every((element, index) => element === b[index]))
}

//see if a list contains another list
function containsList(parent, child) {
    let contains = false
    parent.forEach(element => {
        if(compare(element, child)) {
            contains = true
        }
    });
    return contains
}

//returns current gamemode; e.g., 8x10, 16x38
function currentLb() {
    return `${set['size']}x${mineCount}`
}

//returns formatted time
function formatTimeElapsed(time, timer) {
    //makes it work for leaderboard as well
    if (startTime == 0 && timer) {
        return "00:00.000"
    }
    let minutes = Math.floor(time / (60 * 1000));
    let seconds = Math.floor((time % (60 * 1000)) / 1000);
    let milliseconds = Math.floor((time % 1000));
    let formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    return formattedTime;
}

/** draws a line!!
 * @param {num} x1
 * @param {num} y1
 * @param {num} x2
 * @param {num} y2
 */
function line(x1, y1, x2, y2, round, canv) {
    if(!canv) {
        canv = ctx
    }
    canv.beginPath(); 
    if(round){ctx.lineCap = "round"}
    canv.moveTo(x1, y1);
    canv.lineTo(x2, y2);
    canv.stroke();
    canv.closePath();
}

//draws a grid for the minefield
function drawGrid(){
    ctx.lineWidth = 1.5
    for (i = 1; i < set['size']; i++) {
        let width = minefield.width
        let size = width/set['size']
        line(i*size, 0, i*size, width, false, GDctx) // x
        line(0, i*size, width, i*size, false, GDctx) // y
        line(i*size, 0, i*size, width, false, GDctx)
        line(0, i*size, width, i*size, false, GDctx)
    }
}

//disables non-toggled setting
function countSet(count) {
    document.getElementById("count").parentElement.children[1].disabled = !count
    document.getElementById("percent").parentElement.children[1].disabled = count
}

//draws favicon
function favicon() {
    //defining now canvas
    var canvas = document.createElement('canvas');
    canvas.width = 32;canvas.height = 32;
    var fav = canvas.getContext('2d');

    //actually drawing
    fav.lineWidth = 2.7
    fav.beginPath()
    fav.fillStyle = 'red'
    fav.strokeStyle = 'red'
    //make background circle
    fav.arc(
                (.5)*(32),
                (.5)*(32),
                .4*(32),
                0,
                2 * Math.PI
            )
    fav.stroke()
    fav.fill()
    fav.closePath()
    fav.beginPath()
    fav.strokeStyle = 'black'

    //draw mine circle
    fav.arc(
                (.5)*(32),
                (.5)*(32),
                .2*(32),
                0,
                2 * Math.PI
            )
    fav.stroke()

    //draw mine lines
    for (let i=0; i<6; i++) {
        line(
            (.2*Math.cos((Math.PI/6)+i*(Math.PI/3))+.5)*(32),
            (.2*Math.sin((Math.PI/6)+i*(Math.PI/3))+.5)*(32),
            (.3*Math.cos((Math.PI/6)+i*(Math.PI/3))+.5)*(32),
            (.3*Math.sin((Math.PI/6)+i*(Math.PI/3))+.5)*(32),
            true,
            fav
        )
    }
    fav.closePath()

    //apply favicon
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
}

//logging function
function logBoard () {
    for (j = 0; j < set['size']; j++){
        console.log(board[j])
    }
    for (j = 0; j < set['size']; j++){
        console.log(stat[j])
    }
}

//make game ready
function reset() { 
    //reset board   
    ctx.clearRect(0, 0, minefield.width, minefield.height);

    //set vars
    firstClick = true
    scalar = minefield.width/set['size']
    board = []
    stat = []

    //set mineCount
    if(set['count']) {
        mineCount = set['mineCount']
    } else {
        mineCount = Math.round((Math.pow(set['size'], 2)) * (set['minePercent'] / 100))
    }
    mineCount = Math.min(mineCount, (Math.pow(set['size'], 2)-9))

    //set up flag counter
    flagCounter.innerHTML = `🏳 0/${mineCount}`

    //set up leaderboard
    if(!Object.keys(leaderboard).includes(currentLb())) {
        leaderboard[currentLb()] = []
    }
    document.getElementById('leaderboard').innerHTML = ""
    
    //create title
    let title = document.createElement('p')
    title.innerHTML = `${set['size']}x${set['size']}, ${mineCount} mines`
    title.style.width = "max-content"
    document.getElementById('leaderboard').append(title)
    
    //append times
    leaderboard[currentLb()].slice(0,10).forEach(element => {
        let p = document.createElement('p')
        p.innerHTML = formatTimeElapsed(element)
        document.getElementById('leaderboard').append(p)
    })

    //set up board
    for (i = 0; i < set['size']; i++){
        let line = []     
        for (j = 0; j < set['size']; j++){
            line.push(0)
        }
        board.push(line)
    }

    //set up status
    for (i = 0; i < set['size']; i++){
        let line = []     
        for (j = 0; j < set['size']; j++){
            line.push(false)
        }
        stat.push(line)
    }

    //other setup
    drawGrid()
    document.getElementById("time").innerHTML = formatTimeElapsed(0)
    flagCount = 0
    flagCounter.innerHTML = `🏳 ${flagCount}/${mineCount}`
    game = "pre"
}

//what happens when you click
function clickHandler(e) {
    if(game == "over") {return}
    //find current cursor's box
    let rect = minefield.getBoundingClientRect();
    let box = []
    box[0] = Math.floor(((e.clientX - rect.left)/minefieldDim)*set['size'])
    box[1] = Math.floor(((e.clientY - rect.top)/minefieldDim)*set['size'])
    switch (e.button) {
        case 0: //left click
            check(box[0], box[1])
            break;
        case 2: //right click
            flag(box[0], box[1])
            break;
        default: //unknown
            log.textContent = `Unknown button code: ${e.button}`;
    }
}

//what happens when you tap
function tapHandler(e) {
    if(game == "over") {return}
    if (boxX != undefined && boxY !=undefined) {
        switch (e.key) {
            case "z": 
                check(boxX, boxY)
                break;
            case "x":
                flag(boxX, boxY)
                break;

        }
    }
}

//open and close settings
function setToggle() {
    multi.style.display = "none"
    if(settings.style.display == "none" ){
        document.getElementById("count").parentElement.children[1].value = set['mineCount']
        document.getElementById("percent").parentElement.children[1].value =  set['minePercent']
        document.getElementById("count").checked = set['count']
        document.getElementById("dimInput").value = set['size']
        settings.style.display = "block"
    } else {
        settings.style.display = "none"
        saveConfig()
        reset()
    }
}

//open and close multiplayer menu
function multiToggle() {
    if(multi.style.display == "none" ){
        multi.style.display = "block"
    } else {
        multi.style.display = "none"
    }
}

//update current mouse box
minefield.addEventListener('mousemove', function(e) {
    //find current cursor's box
    let rect = minefield.getBoundingClientRect();
    let box = []
    boxX = Math.floor(((e.clientX - rect.left)/minefieldDim)*set['size'])
    boxY = Math.floor(((e.clientY - rect.top)/minefieldDim)*set['size'])
});

//make undefined when leave; doesnt create errors
minefield.addEventListener('mouseleave', function(e) {
    boxX = undefined
    boxY = undefined
})

//other keyboard listeners
window.addEventListener('keydown', function(e) {
    switch (e.key) {
        case " ": //space - abort/retry
            if(game == "over") {
                reset()
            } else if (game == "during") {
                abort()
            }
            break;
        case "Escape": //escape - open settings
            setToggle()
            break;
    }
})

//handlers
minefield.addEventListener('mousedown', clickHandler)
window.addEventListener('keydown', tapHandler, true)

//window resizer
addEventListener("resize", resize)
