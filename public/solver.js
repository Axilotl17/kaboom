const maxLevel = 3
var level

function startSolve() {

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
    level = 0 
    possibleSols = []
    solution = solve()
    if(solution.some(x => x.includes(-1))) {
        console.log("got stuck")
    } else if (matrixEquality(solution, board)) {
        console.log("solved successfully!")
    } else {
        console.log("incorrect solution.")
    }

    if(true) {
        runForAll((x, y) => {
            if(solution[y][x] === 9) {
                if(stat[y][x] != "flag") flag(x, y);
            } else if (solution[y][x] >= 0) reveal(x, y);
        });
    }
}

function solve(solving) {
    let immediate = true;

    if(!solving) {
        immediate = false;
        solving = board.map((row, y) => row.map((item, x) => {
            if(stat[y][x]) {return item} else return -1; // -1 is unknown, 9 is mine
        }));
    };

    while(solving.some(x => x.includes(-1))) { // while unknowns in solution
        let next = false;
        if(level < 1) level = 1

        // this solves for all trivial solutions
        runForAll((x, y) => {
            if (solving[y][x] >= 0 && solving[y][x] != 9) { // if revealed
                let spots = 0;
                let flags = 0;
                
                runForAdjacent((nx, ny) => { // count spots and flags
                    if (solving[ny][nx] === -1) spots++;
                    if (solving[ny][nx] === 9) flags++;
                }, x, y);

                if (flags === solving[y][x] && spots > 0 && !immediate) { // if complete, reveal around
                    runForAdjacent((nx, ny) => {
                        if (solving[ny][nx] === -1) solving[ny][nx] = board[ny][nx];
                        if (solving[ny][nx] === -1) {
                            console.log(`revealing ${nx}, ${ny} by ${x}, ${y}. ${flags} flags, ${spots} spots.`)
                            if (board[ny][nx] === 9) { // debug
                                console.log(`REVEALED MINE @ ${nx}, ${ny}`)
                                console.log(solving)
                            }
                        }
                    }, x, y); 
                    next = true; // exits the while loop
                } else if (spots === solving[y][x] - flags && spots > 0) { // if incomplete and trivial, complete
                    runForAdjacent((nx, ny) => {
                        if (solving[ny][nx] === -1) solving[ny][nx] = 9;
                    }, x, y);
                    next = true;
                }
            }
        })

        if(next) continue;
        if(level < 2) level = 2

        let {matrix, unknowns} = matrixFill(solving) // returns matrix and unknowns as a key

        rref(matrix).forEach((row) => {
            console.log(row)
            if(row.indexOf(-1) === -1) {
                if(row.slice(0, -1).filter(e => e === 1).length === 1 && row.at(-1) == 1) {
                    let x = unknowns[row.indexOf(1)][0] // the x value of the unknown at the pivot
                    let y = unknowns[row.indexOf(1)][1]
                    solving[y][x] = 9
                    next = true
                } else if (row.at(-1) == 0 && row.at(-1) === 0 && !immediate) { // considers when [1 1 1 | 0
                    row.forEach((e, i) => {
                        if(e === 1){
                            let x = unknowns[i][0] // the x value of the unknown at the 1
                            let y = unknowns[i][1]
                            solving[y][x] = board[y][x]
                            if(board[y][x] === 9) { // debug
                                console.log(`REVEALED MINE @ ${x}, ${y}`)
                                console.log(solving)
                                }
                            next = true
                        }
                    })
                }
            }
        });

        if(next) continue;
        if(level < 3) level = 3

        if(immediate) return solving;

        // let possibleSols = []

        unknowns.forEach(unknown => {
            solution = solving.map((r, i) => r.map((e, j) => {
                if(i === unknown[1] && j === unknown[1]) {
                    console.log(`replacing ${unknown[0]}, ${unknown[1]} with 9`)
                    return 9
                } else {
                    //console.log(`replacing ${unknown[0]}, ${unknown[1]} with ${e}`)
                    return e
                }
            }))
            possibleSols.push(solve(solution));
        })

        console.log(possibleSols)
        if(next) continue;
        console.log(unknowns)
        return solving; // if stuck this will trigger
    }
    return solving; // if solution in one go this will trigger
}

var possibleSols = []

function matrixFill(solving) {
    let matrix = []
    let unknowns = []
    runForAll((x, y) => {
        if (solving[y][x] > 0 && solving[y][x] != 9) { // any nonzero revealed space
            let spots = 0;
            let flags = 0;
            
            runForAdjacent((nx, ny) => { // count spots and flags
                if (solving[ny][nx] === -1) spots++;
                if (solving[ny][nx] === 9) flags++;
            }, x, y);

            if(flags != solving[y][x] && spots != solving[y][x] - flags && spots > 0){ // only if incomplete
                // console.log(`checking around ${x}, ${y}`)
                matrix.push([...Array(unknowns.length).fill(0), solving[y][x] - flags]); // new row
                runForAdjacent((nx, ny) => {
                    let loc = [nx, ny]; // location
                    if (solving[ny][nx] === -1) {
                        //console.log('is unknown')
                        let index = unknowns.findIndex(sub => sub[0] === loc[0] && sub[1] === loc[1]);

                        if(index == -1) { // if not already considered
                            unknowns.push(loc);
                            index = unknowns.length - 1
                            for(let i = 0; i < matrix.length; i++) { // fill new column 
                                matrix[i].splice(Math.max(matrix[i].length - 1, 0), 0, 0) // but in penultimate pos
                            }
                        }
                        matrix[matrix.length - 1][index] = 1;
                    }
                }, x, y);
            }
        }
    })
    return({
        "matrix" : matrix,
        "unknowns" : unknowns
    })
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

function matrixEquality(matrixA, matrixB) {
    return !matrixA.some((r, i) => r.some((e, j) => e != matrixB[i][j]))
}