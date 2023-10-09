//place mines
function propagate(xo,yo) {

    //decide amount
    if((Math.pow(config['size'], 2)) - (9 + mineCount) < 0) {
        mineCount -= 9 //make sure always 9 spaces open
    }
    for (i = 0; i <= (mineCount-1); i++){
        //define starting range, cannot have mine
        let range = []
        for (let y = -1; y < 2; y++) {
            if(yo+y >= 0 && yo+y < config['size']) {
                for (let x = -1; x < 2; x++) {
                    if(xo+x >= 0 && xo+x < config['size']) {
                        range.push([(xo+x), (yo+y)])
                    }
                }
            }
        }

        //pick random one
        let box = [randNum(config['size']), randNum(config['size'])]
        //redo if taken
        while(board[box[1]][box[0]] == 9 || containsList(range, [(box[0]), (box[1])])) {
            box = [randNum(config['size']), randNum(config['size'])]
        }
        //set as mine
        board[box[1]][box[0]] = 9
        //incriment surrounding tiles
        for (let y = -1; y < 2; y++) {
            if(box[1]+y >= 0 && box[1]+y <= (config['size']-1)) {
                for (let x = -1; x < 2; x++) {
                    if(box[0]+x >= 0 && box[0]+x < config['size']) {
                        if(board[box[1]+y][box[0]+x] != 9) {
                            board[box[1]+y][box[0]+x]++
                        }
                    }
                }
            }
        }
    }
}

//draw when reveal
function draw(x, y) {
    stat[y][x] = true //mark on status
    ctx.beginPath(); 
    //fill background; gradient according to num
    ctx.fillStyle = `rgb(
        ${220-((5)*board[y][x])},
        ${220-((36)*board[y][x])}, 
        ${220-((36)*board[y][x])}
        )`
    ctx.fillRect(
        x*scalar, 
        y*scalar, 
        (scalar), 
        (scalar)
        );

    //text setup
    ctx.textAlign = "center"
    ctx.font = `bold ${(.8)*(scalar)}px "Andale Mono", monospace`;
    ctx.fillStyle="black"
    if(board[y][x] != 9 && board[y][x] != 0) { //if not mine or 0, write num
        ctx.fillText(
            board[y][x],
            (.5+x)*(scalar),
            (.8+y)*(scalar)
            )
    } else if (board[y][x] != 0) { // if not 0 (meaning its mine), draw mine
        ctx.lineWidth = scalar/10
        ctx.arc( //circle
            (.5+x)*(scalar),
            (.5+y)*(scalar),
            .2*(scalar),
            0,
            2 * Math.PI
        )
        ctx.stroke(); 
        for (let i=0; i<6; i++) { //bumps
            line(
                (.2*Math.cos((Math.PI/6)+i*(Math.PI/3))+x+.5)*(scalar),
                (.2*Math.sin((Math.PI/6)+i*(Math.PI/3))+y+.5)*(scalar),
                (.3*Math.cos((Math.PI/6)+i*(Math.PI/3))+x+.5)*(scalar),
                (.3*Math.sin((Math.PI/6)+i*(Math.PI/3))+y+.5)*(scalar),
                true
            )
        }
        ctx.lineWidth = minefield.width/800
    }
    ctx.closePath();
}

//reveal mines
function reveal(xo, yo, click) {
    if(stat[yo][xo] === false){ // if not revealed
        draw(xo, yo)
    } else if (stat[yo][xo] == "flag" && click === false){ //if removing flag
        stat[yo][xo] = false
        draw(xo, yo)
    }
    if (board[yo][xo] == 9 && stat[yo][xo] != "flag") { //if click on mine
        lose()
    }
    if (board[yo][xo] == 0) { //if zero, reveal surrounding
        for (let y = -1; y < 2; y++) {
            if(yo+y >= 0 && yo+y < config['size']) {
                for (let x = -1; x < 2; x++) {
                    if(xo+x >= 0 && xo+x < config['size']) {
                        if(stat[yo+y][xo+x] === false || stat[yo+y][xo+x] === "flag"){
                            reveal(xo+x, yo+y, false) 
                        }
                    }
                }
            }
        }
    } else if (stat[yo][xo] === true && click) { //if click on revealed square
        let flags = 0
        //count surrounding flags
        for (let y = -1; y < 2; y++) {
            if(yo+y >= 0 && yo+y < config['size']) {
                for (let x = -1; x < 2; x++) {
                    if(xo+x >= 0 && xo+x < config['size']) {
                        if(stat[yo+y][xo+x] === "flag"){
                            flags++
                        }
                    }
                }
            }
        }
        if(flags == (board[yo][xo])) { //if enough flags, reveal surrounding
            for (let y = -1; y < 2; y++) {
                if(yo+y >= 0 && yo+y < config['size']) {
                    for (let x = -1; x < 2; x++) {
                        if(xo+x >= 0 && xo+x < config['size']) {
                            if(stat[yo+y][xo+x] === false){
                                reveal(xo+x, yo+y, false)
                            }
                        }
                    }
                }
            }
        }
    }
    checkWin()
}

//mark flag
function flag(x,y) {
    if(stat[y][x] === false){
        stat[y][x] = "flag"
        updateFlags(1)
        ctx.beginPath()
        ctx.fillStyle="rgb(120,220,120)"
        ctx.fillRect( //green rect
        ((x/config['size'])*minefield.width),
        ((y/config['size'])*minefield.width),
        (scalar), 
        (scalar)
        );
        drawGrid()
        ctx.lineWidth = minefield.width/(config['size']*10)
        line( //post
            (.7+x)*(scalar),
            (.2+y)*(scalar),
            (.5+x)*(scalar),
            (.8+y)*(scalar),
            true
        )
        line( //top line
            (.7+x)*(scalar),
            (.2+y)*(scalar),
            (.3+x)*(scalar),
            (.3+y)*(scalar),
            true
        )
        line( //middle line
            (.3+x)*(scalar),
            (.3+y)*(scalar),
            (.566+x)*(scalar),
            (.6+y)*(scalar),
            true
        )
        ctx.lineWidth = minefield.width/800

    } else if (stat[y][x] === "flag") { //clear flag
        stat[y][x] = false
        updateFlags((-1))
        ctx.beginPath()
        ctx.fillStyle="white"
        ctx.fillRect(
        x*scalar,
        y*scalar,
        scalar, 
        scalar
        );
        drawGrid()
    }

}

function check(x, y) { //middleman... maybe elim
    if(firstClick === true) {
        startTime = Date.now()
        propagate(x, y)
        game = "during"
        updateTime = setInterval(function() {
            document.getElementById("time").innerHTML = formatTimeElapsed(Date.now() - startTime, true)
        }, 1)
        firstClick = false
    }
    reveal(x, y, true)
    drawGrid()
}



function win() { //woohoo!
    endGame()
    board.forEach((row, y) => { //flag remaining mines
        row.forEach((item, x) => {
            if (item == 9 && stat[y][x] != "flag") {
                flag(x, y)
            }
        });
    });
    ctx.fillStyle = 'rgb(120,220,120, 0.7)'
    ctx.fillRect(0, 0, minefield.width, minefield.width)
    ctx.fillStyle = 'rgb(0,0,0,1)'
    ctx.font = `bold ${.15*minefield.width}px Andale Mono`;
    ctx.fillText("You won!", .5*minefield.width, .35*minefield.width)
    ctx.font = `bold ${.09*minefield.width}px Andale Mono`;
    ctx.fillText(formatTimeElapsed(finalTime), .5*minefield.width, .5*minefield.width)
    ctx.font = `bold ${.05*minefield.width}px Andale Mono`;
    ctx.fillText("press [space] to try again.", .5*minefield.width, .6*minefield.width)
    addTime(finalTime)
}

function lose() { //boohoo!
    if(game == "over") {return}
    endGame()
    stat.forEach((row, y) => { //reveal remaining tiles
        row.forEach((item, x) => {
            if (item == false) {
                draw(x, y)
            } else if (item == "flag" && board[y][x] != 9) {
                draw(x, y)
            }
        });
    });
    drawGrid()
    ctx.fillStyle = 'rgb(240,20,20,0.7)'
    ctx.fillRect(0, 0, minefield.width, minefield.width)
    ctx.fillStyle = 'rgb(0,0,0,1)'
    ctx.font = `bold ${.15*minefield.width}px Andale Mono`;
    ctx.fillText("You lost.", .5*minefield.width, .45*minefield.width)
    ctx.font = `bold ${.05*minefield.width}px Andale Mono`;
    ctx.fillText("press [space] to try again.", .5*minefield.width, .55*minefield.width)
}

//abort midgame
function abort() {
    endGame()
    stat.forEach((row, y) => { //reveal remaining tiles
        row.forEach((item, x) => {
            if (item == false) {
                draw(x, y)
            } else if (item == "flag" && board[y][x] != 9) {
                draw(x, y)
            }
        });
    });
    drawGrid()
    ctx.fillStyle = 'rgb(150,150,150,0.7)'
    ctx.fillRect(0, 0, minefield.width, minefield.width)
    ctx.fillStyle = 'rgb(0,0,0,1)'
    ctx.font = `bold ${.12*minefield.width}px Andale Mono`;
    ctx.fillText("Game aborted.", .5*minefield.width, .45*minefield.width)
    ctx.font = `bold ${.05*minefield.width}px Andale Mono`;
    ctx.fillText("press [space] to try again.", .5*minefield.width, .55*minefield.width)
}

//check if we won
function checkWin() {
    let complete
    if(game == "during") {
        complete == true
    } else {
        return
    }
    complete = true
    board.forEach((row, y) => { //for each item on board, check if revealed
        row.forEach((item, x) => {
            if (item != 9 && stat[y][x] != true) {
                complete = false
                return
            }
        });
    });
    if(complete) { //if all revealed, win.
        win()
    }
}

//end game
function endGame() {
    clearInterval(updateTime)
    finalTime = Date.now() - startTime
    game = "over"
    document.getElementById("time").innerHTML = formatTimeElapsed(finalTime)
}

//update flag counter
function updateFlags(n) {
    flagCount += n 
    flagCounter.innerHTML = `🏳 ${flagCount}/${mineCount}`
}