
//fix empty set
if(localStorage.getItem('set') != null) {
    if(JSON.parse(localStorage.getItem('set')).constructor != Object) {
        localStorage.setItem('set', JSON.stringify({}))
    }
} else {
    //set default
    localStorage.setItem('set', JSON.stringify({
        "mineCount": 10,
        "minePercent": 15,
        "count": true,
        "size": 8
    }))
}

//global vars
var set = JSON.parse(localStorage.getItem('set'))
var leaderboard = JSON.parse(localStorage.getItem('leaderboard'))

//fix empty leaderboard
if(localStorage.getItem('leaderboard') != null) {
    if(JSON.parse(localStorage.getItem('leaderboard')).constructor != Object) {
        localStorage.setItem('leaderboard', JSON.stringify({}))
    }
} else {
    localStorage.setItem('leaderboard', JSON.stringify({}))
}

//add time to leaderboard
function addTime(time) {
    leaderboard[currentLb()].push(time)
    leaderboard[currentLb()].sort(function(a, b){return a-b}) //sort in order
    if (leaderboard[currentLb()].length > 100) {
        leaderboard[currentLb()].length = 100 //only keep top 100
    }
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
}

//saves setting set
function saveConfig() {
    set = {
        "mineCount": parseInt(document.getElementById("count").parentElement.children[1].value),
        "minePercent": parseInt(document.getElementById("percent").parentElement.children[1].value),
        "count": document.getElementById("count").checked,
        "size": parseInt(document.getElementById("dimInput").value)                 
    }

    //mins and maxes
    set['mineCount'] = Math.max(set['mineCount'], 1)
    set['minePercent'] = Math.max(set['minePercent'], 1)
    set['minePercent'] = Math.min(set['minePercent'], 100)
    set['size'] = Math.max(set['size'], 4)
    set['size'] = Math.min(set['size'], 100)

    localStorage.setItem('set', JSON.stringify(set))
}