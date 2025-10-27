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
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            let spots = 0;
            let flags = 0;

            if (stat[y][x] === true && board[y][x] > 0) {
                runForAdjacent((nx, ny) => {
                    if (!stat[ny][nx]) spots++;
                    if (stat[ny][nx] === "flag") flags++;
                }, x, y);
                console.log("checking" + x + "," + y + " : " + spots + "," + flags)
                if (flags === board[y][x] && spots > 0) {
                    console.log("revealing around " + x + ", " + y)
                    runForAdjacent((nx, ny) => {
                        if (!stat[ny][nx]) reveal(nx, ny);
                    }, x, y); // exits `solve()` immediately
                    return true;
                } else if (spots === board[y][x] - flags && spots > 0) {
                    console.log("flagging around " + x + ", " + y)
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
                        let spots = 0;
            let flags = 0;

            if (stat[y][x] === true && board[y][x] > 0) {
                runForAdjacent((nx, ny) => {
                    if (!stat[ny][nx]) spots++;
                    if (stat[ny][nx] === "flag") flags++;
                }, x, y);  
            }
        }
    }
}

function rref(matrix) {
    for(const i in matrix) { // i is each row
        console.log(`row : ${i}`)
        for(const j in i) { // each element in each row
            if(matrix[i][j] != 0) { // if its not 1 and not 0
                if(matrix[i][j] == 1){
                    break; // exit the current row, already has pivot as 1
                } else {
                    let pivot = matrix[i][j]
                    console.log(pivot)
                    for(const k in i) { // divide whole row by the pivot
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