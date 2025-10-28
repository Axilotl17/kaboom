function solveNext() {
    if(firstClick === true) {
        startTime = Date.now();
        mid = Math.floor((set['size'] - 1)/2);
        propagate(mid, mid);
        game = "during"
        updateTime = setInterval(function() {
            document.getElementById("time").innerHTML = formatTimeElapsed(Date.now() - startTime, true)
        }, 1)
        firstClick = false
            reveal(mid, mid, true)
        drawGrid()
    }
    else{
        solve();
    }
}

function solve() {

    // this solves for all trivial solutions
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            let spots = 0;
            let flags = 0;

            if (stat[y][x] === true && board[y][x] > 0) { // if revealed and not 0
                runForAdjacent((nx, ny) => { // count spots and flags
                    if (!stat[ny][nx]) spots++;
                    if (stat[ny][nx] === "flag") flags++;
                }, x, y);
                //console.log("checking" + x + "," + y + " : " + spots + "," + flags)
                if (flags === board[y][x] && spots > 0) { // if complete, reveal around
                    //console.log("revealing around " + x + ", " + y)
                    runForAdjacent((nx, ny) => {
                        if (!stat[ny][nx]) reveal(nx, ny);
                    }, x, y); 
                    return true; // exits `solve()` immediately
                } else if (spots === board[y][x] - flags && spots > 0) { // if incomplete and trivial, complete
                    //console.log("flagging around " + x + ", " + y)
                    runForAdjacent((nx, ny) => {
                        if (!stat[ny][nx]) flag(nx, ny);
                    }, x, y);
                    return true;
                }
            }
        }
    }

    for (let y = 0; y < board.length; y++) { // matrix time
        for (let x = 0; x < board[y].length; x++) { 
            let unknowns = []
            let matrix = []
            let checked = []

            // assuming that its incomplete and not trivial - shouldn't have gotten here otherwise
            if (stat[y][x] === true && board[y][x] > 0) { // any nonzero revealed space
                matrixFill(x, y, unknowns, checked, matrix)
                console.log(matrix)
                return true;
            }
        }
    }
}

function matrixFill(x, y, unknowns, checked, matrix) {
    checked.push(`${x}, ${y}`);
    console.log(`checking ${x}, ${y}`)
    console.log(checked)
    matrix.push([...Array(unknowns.length).fill(0), board[y][x]]); // new row
    runForAdjacent((nx, ny) => {
        if (!stat[ny][nx]) {
            let loc = `${nx}, ${ny}`;
            //locations.push(loc);
            let index = unknowns.indexOf(loc);

            if(index == -1) { // if not already considered
                unknowns.push(loc);
                index = unknowns.length - 1
                for(let i = 0; i < matrix.length; i++) { // fill new column 
                    matrix[i].splice(matrix[i].length - 1, 0, 0) // but in penultimate pos
                }
            }

            matrix[matrix.length - 1][index] = 1;
        } else if (stat[ny][nx] === true && board[ny][nx] > 0 && checked.indexOf(`${nx}, ${ny}`) == -1) {
            //console.log(`checked doesnt contain ${loc}`)
            //console.log(checked.indexOf(loc))
            matrixFill(nx, ny, unknowns, checked, matrix)
        }
    }, x, y);  
}

function rref(matrix) {
    for(let i = 0; i < matrix.length; i++) { // i is each row
        //console.log(`row : ${i}`)
        for(let j = 0; j < matrix[i].length; j++) { // each element in each row
            if(matrix[i][j] != 0) { // if its not 1 and not 0
                if(matrix[i][j] == 1){
                    break; // exit the current row, already has pivot as 1
                } else {
                    let pivot = matrix[i][j]
                    console.log(pivot)
                    for(let k = 0; k < matrix[i].length; k++) { // divide whole row by the pivot
                        console.log(`${i}, ${k} : ${matrix[i][k]} -> ${matrix[i][k]} / ${pivot} = ${matrix[i][k] / pivot}`)
                        matrix[i][k] = matrix[i][k] / pivot
                    }
                    break;
                }
            }
        }
    }
    return matrix;
}