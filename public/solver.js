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
            if (stat[y][x] === true && board[y][x] > 0) { // if revealed and not 0
                let spots = 0;
                let flags = 0;
                
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
            if (stat[y][x] === true && board[y][x] > 0) { // any nonzero revealed space
                let spots = 0;
                let flags = 0;
                
                runForAdjacent((nx, ny) => { // count spots and flags
                    if (!stat[ny][nx]) spots++;
                    if (stat[ny][nx] === "flag") flags++;
                }, x, y);

                if(flags != board[y][x] && spots != board[y][x] - flags && spots > 0){ // only if incomplete
                    let unknowns = []
                    let matrix = []
                    let queue = {}

                    queue[`${x}, ${y}`] = {
                        'checked' : false,
                        'x' : x,
                        'y' : y
                    }
                    matrixFill(x, y, unknowns, queue, matrix)
                    console.log(matrix)
                    // matrix = rref(matrix)
                    // matrix.forEach(element => {
                    //     console.log(element)
                    // });
                    return true;
                }
            }
        }
    }
}

function matrixFill(x, y, unknowns, queue, matrix) {
    console.log('queue:')
    console.log(queue)
    console.log(`checking around ${x}, ${y}`)
    queue[`${x}, ${y}`].checked = true; // true means has been checked 

    let flags = 0

    runForAdjacent((nx, ny) => { // count spots and flags
        if (stat[ny][nx] === "flag") flags++;
    }, x, y);

    matrix.push([...Array(unknowns.length).fill(0), board[y][x] - flags]); // new row
    runForAdjacent((nx, ny) => {
        let loc = `${nx}, ${ny}`; // location
        //console.log(`checking ${loc} by ${x}, ${y}`)

        let nflags = 0

        runForAdjacent((nx, ny) => { // count spots and flags
            if (stat[ny][nx] === "flag") nflags++;
        }, x, y);
        if (!stat[ny][nx]) {
            //console.log('is unknown')
            let index = unknowns.indexOf(loc);

            if(index == -1) { // if not already considered
                unknowns.push(loc);
                index = unknowns.length - 1
                for(let i = 0; i < matrix.length; i++) { // fill new column 
                    matrix[i].splice(matrix[i].length - 1, 0, 0) // but in penultimate pos
                }
            }

            matrix[matrix.length - 1][index] = 1;
        } else if (stat[ny][nx] === true && board[ny][nx] - nflags > 0) { 
            console.log(`nflags = ${nflags}`)
            console.log(`board[${ny}][${nx}] = ${board[ny][nx]}`)
            if(!(loc in queue)) {
                queue[loc] = {
                    'checked' : false,
                    'x' : nx,
                    'y' : ny
                }
            }
        }
    }, x, y);
    nextUp = Object.entries(queue).find(([key, val]) => !val.checked); // first element that isnt checked
    console.log(queue)
    if(nextUp) matrixFill(nextUp[1].x, nextUp[1].y, unknowns, queue, matrix);
}

function rref(matrix) {
    let lead = 0;
    const rowCount = matrix.length;
    const colCount = matrix[0].length;

    for (let r = 0; r < rowCount; r++) {
        if (lead >= colCount) {
            break; // All columns processed
        }

        let i = r;
        // Find a row with a non-zero element in the current 'lead' column
        while (matrix[i][lead] === 0) {
            i++;
            if (i === rowCount) {
                i = r;
                lead++;
                if (lead === colCount) {
                    return matrix; // All columns processed, no more pivots
                }
            }
        }

        // Swap rows to bring the non-zero element to the current pivot position
        [matrix[r], matrix[i]] = [matrix[i], matrix[r]];

        // Normalize the pivot row: make the leading element 1
        let divisor = matrix[r][lead];
        for (let j = 0; j < colCount; j++) {
            matrix[r][j] /= divisor;
        }

        // Eliminate other entries in the current pivot column
        for (let i = 0; i < rowCount; i++) {
            if (i !== r) {
                let factor = matrix[i][lead];
                for (let j = 0; j < colCount; j++) {
                    matrix[i][j] -= factor * matrix[r][j];
                }
            }
        }
        lead++;
    }
    return matrix;
}