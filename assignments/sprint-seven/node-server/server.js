var http = require('http');
var url = require('url');
var fs = require('fs');

const CLIENT_ID = "97780249168-4o4fu56aho7ttrr1dg3e4dmtjkqbpl63.apps.googleusercontent.com"

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const server = http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    // res.writeHead(200, {'Content-Type': 'text/html'});
    // res.write(filename);
    // return res.end();
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

let gameStarted = false
let startingSoon = false
let gameOver = false

let startTime = 0

let players = {}
let playersImages = {}
let playerTokens = {}

let seed = Math.floor(Math.random() * 50000)

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    //console.log(payload)
    return payload
}

const io = require('socket.io')(server);
console.log("Started server. Listening for connections...")
io.on('connection', socket => {
    socket.on("request_join", data => {
        if (gameStarted) {
            socket.emit("reject_join", 1)
        }
        else {
            try {
                verify(data).then((payload) => {
                    if (Object.values(playerTokens).indexOf(data) == -1) {
                        players[socket.id] = {
                            p: [0, 0, 0],
                            q: [0, 0, 0, 1],
                            t: 0,
                            b: 0,
                            alive: true
                        }
                        playersImages[socket.id] = payload.picture
                        playerTokens[socket.id] = data
                        console.log("Connected: " + socket.id + ", # players: " + Object.keys(players).length)
                        socket.emit("get_id", {
                            id: socket.id,
                            players: players,
                            playersImages: playersImages,
                            seed: seed,
                            gameStarted: gameStarted
                        })
                        if (startingSoon)
                            socket.emit("starting_soon", 15000)
                        socket.broadcast.emit("player_connect", {
                            id: socket.id,
                            imageUrl: payload.picture
                        })
                    }
                    else {
                        socket.emit("reject_join", 2)
                    }
                })
            }
            catch (error) {
                console.log('Bad token')
                socket.emit("reject_join", 3)
            }
        }
    })

    socket.on('echo', data => {
        console.log("echo: " + data);
        socket.emit("echo", data);
    });
    socket.on('disconnect', () => {
        if (socket.id in players) {
            socket.broadcast.emit("player_disconnect", socket.id)
            delete players[socket.id]
            delete playersImages[socket.id]
            delete playerTokens[socket.id]
            console.log("Disconnect: " + socket.id + ", # players: " + Object.keys(players).length)
        }
    });
    socket.on("updatePlayer", (data) => {
        //console.log(data)
        players[socket.id] = data
    })
    socket.on("get_num_players", data => {
        if (data != "27")
            return
        socket.emit("get_num_players", Object.keys(players).length)
    })
    socket.on("hit", data => {
        //players[data].alive = false
        //io.emit("updatePlayers", players)
        io.emit("hit", data)
    })
    socket.on("die", data => {
        io.emit("die", data)
    })
})

function update() {
    let numAlive = 0
    for (let player in players) {
        if (players.hasOwnProperty(player)) {
            if (players[player].alive) {
                numAlive++
            }
        }
    }

    if (gameStarted) {
        if (numAlive <= 1) {
            if (!gameOver) {
                gameOver = true
                io.emit("game_over", true)
                setTimeout(() => {
                    seed = Math.floor(Math.random() * 50000)
                    gameStarted = false
                    startingSoon = false
                    gameOver = false
                    players = {}
                    playersImages = {}
                    playerTokens = {}
                    io.emit("reset_game", true)
                    console.log("Resetting game...")
                }, 3000)
                console.log("Winner. Restarting soon...")
            }
        }
        var d = new Date();
        var n = d.getTime();
        if (n - startTime > 60 * 2 * 1000 + 5000) {
            if (!gameOver) {
                gameOver = true
                io.emit("game_over", true)
                setTimeout(() => {
                    seed = Math.floor(Math.random() * 50000)
                    gameStarted = false
                    startingSoon = false
                    gameOver = false
                    players = {}
                    playersImages = {}
                    playerTokens = {}
                    io.emit("reset_game", true)
                    console.log("Resetting game...")
                }, 3000)
                console.log("Winner. Restarting soon...")
            }
        }
    } else {
        if (numAlive >= 2) {
            if (!startingSoon) {
                startingSoon = true
                io.emit("starting_soon", 15000)
                setTimeout(() => {
                    gameStarted = true
                    io.emit("start_game", true)
                    console.log("Starting game...")
                    var d = new Date();
                    var n = d.getTime();
                    startTime = n
                }, 15000)
                console.log("Starting soon...")
            }
        }
    }

    io.emit("updatePlayers", players)
}
setInterval(update, 16)

server.listen(8080);