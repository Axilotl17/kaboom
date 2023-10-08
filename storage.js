
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

//global vars
var config = JSON.parse(localStorage.getItem('config'))
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



//open and close settings
function setToggle() {
    if(settings.style.display == "none" ){
        document.getElementById("count").parentElement.children[1].value = config['mineCount']
        document.getElementById("percent").parentElement.children[1].value =  config['minePercent']
        document.getElementById("count").checked = config['count']
        document.getElementById("dimInput").value = config['size']
        settings.style.display = "block"
    } else {
        settings.style.display = "none"
        console.log("aa")
        config = {
            "mineCount": parseInt(document.getElementById("count").parentElement.children[1].value),
            "minePercent": parseInt(document.getElementById("percent").parentElement.children[1].value),
            "count": document.getElementById("count").checked,
            "size": parseInt(document.getElementById("dimInput").value)                 
        }
        config['mineCount'] = Math.max(config['mineCount'], 1)
        config['minePercent'] = Math.max(config['minePercent'], 1)
        config['minePercent'] = Math.min(config['minePercent'], 100)
        config['size'] = Math.max(config['size'], 4)
        config['size'] = Math.min(config['size'], 100)

        localStorage.setItem('config', JSON.stringify(config))
        reset()
    }
}