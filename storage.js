//global vars
var config = JSON.parse(localStorage.getItem('config'))
var leaderboard = JSON.parse(localStorage.getItem('leaderboard'))

//fix empty config
if(localStorage.getItem('config') != null) {
    if(JSON.parse(localStorage.getItem('config')).constructor != Object) {
        localStorage.setItem('config', JSON.stringify({}))
    }
} else {
    //set default
    localStorage.setItem('config', JSON.stringify({
        "mineCount": 10,
        "minePercent": 15,
        "count": true,
        "size": 8
    }))
}

//fix empty leaderboard
if(localStorage.getItem('leaderboard') != null) {
    if(JSON.parse(localStorage.getItem('leaderboard')).constructor != Object) {
        localStorage.setItem('leaderboard', JSON.stringify({}))
    }
} else {
    localStorage.setItem('leaderboard', JSON.stringify({}))
}

//set mineCount
if(document.getElementById("count").checked) {
    config['mineCount'] = parseInt(document.getElementById("count").parentElement.children[1].value)
} else if (document.getElementById("percent").checked) {
    config['mineCount'] = Math.round((Math.pow(config['size'], 2)) * (parseInt(document.getElementById("percent").parentElement.children[1].value) / 100))
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

//open and close settings
function setToggle() {
    if(settings.style.display == "none" ){
        settings.style.display = "block"
    } else {
        settings.style.display = "none"
        reset()
    }
}