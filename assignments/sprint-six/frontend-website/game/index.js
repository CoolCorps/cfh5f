let sceneId = 0

//let fogColor = [0.6863, 0.7804, 0.8824, 1.0]; //blue
let fogColor = [185, 124, 70, 1.0]; //orange sand
//let fogColor = [212, 193, 163, 1.0];

fogColor = [fogColor[0] / 255.0, fogColor[1] / 255.0, fogColor[2] / 255.0, fogColor[3]]

state = {}
let input = {
    keys: {},
    keysDown: {},
    mouse: {
        left: false,
        right: false
    },
    mouseDown: {
        left: false,
        right: false
    }
};
window.onkeydown = (e) => {
    if (!e.repeat) {
        input.keys[e.keyCode] = true
        input.keysDown[e.keyCode] = true;
    }
}
window.onkeyup = (e) => {
    input.keys[(e.keyCode)] = false;
}
window.onmousedown = (e) => {
    if (e.button == 0) {
        input.mouse.left = true
        input.mouseDown.left = true
    }
    if (e.button == 2) {
        input.mouse.right = true
        input.mouseDown.right = true
    }
}
window.onmouseup = (e) => {
    if (e.button == 0) {
        input.mouse.left = false
    }
    if (e.button == 2) {
        input.mouse.right = false
    }
}
state.input = input

state.mouse = {
    movementX: 0,
    movementY: 0
}

let textures = {}
$(() => {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: false }) ||
        canvas.getContext('experimental-webgl', { premultipliedAlpha: false, alpha: false });
    const ext = gl.getExtension("OES_vertex_array_object");
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    if (!ext) {
        alert('Unable to initialize OES_vertex_array_object extension. Your browser or machine may not support it.');
        return;
    }

    cubeMesh = new OBJ.Mesh(cubeObj);
    //dogMesh = new OBJ.Mesh(dogObj);
    sphereMesh = new OBJ.Mesh(sphereObj);
    cylinderMesh = new OBJ.Mesh(cylinderObj);
    quadMesh = new OBJ.Mesh(quadObj);
    flashMesh = new OBJ.Mesh(flashObj);
    palmMesh = new OBJ.Mesh(palmObj);

    tankTracksMesh = new OBJ.Mesh(tankTracksObj);
    tankMesh = new OBJ.Mesh(tankObj);
    turretMesh = new OBJ.Mesh(turretObj);
    barrelMesh = new OBJ.Mesh(barrelObj);

    whiteTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

    let imagePaths = [
        "../webgl/images/sand.jpg",
        "../webgl/images/tank.jpg",
        "../webgl/images/tracks.jpg",
        "../webgl/images/crosshair.png",
        "../webgl/images/flash.png",
        "../webgl/images/palm.jpg",
        "../webgl/images/wall.jpg"
    ]
    let images = []
    let numLoadedImages = 0

    imagePaths.forEach((path) => {
        images.push(new Image())
        images[images.length - 1].addEventListener('load', function () {
            let splitPath = path.split("/")
            let key = splitPath[splitPath.length - 1]
            textures[key] = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, textures[key]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
            gl.generateMipmap(gl.TEXTURE_2D);

            numLoadedImages++
            if (numLoadedImages == imagePaths.length) {
                start(gl, ext)
            }
        })
        images[images.length - 1].src = path
    })
})

function leave() {
    window.location.href = "/"
}

function start(gl, ext) {
    const Mode = Object.freeze({ singlePlayer: 0, multiplayerLocal: 1, multiplayer: 2 })

    let mode = Mode.multiplayerLocal

    if (mode == Mode.singlePlayer) {
        main(null, null, null, gl, ext)
    }
    else {
        let socket;
        if (mode == Mode.multiplayerLocal)
            socket = io('http://localhost:8080');
        else if (mode == Mode.multiplayer)
            socket = io("18.188.135.254:8080");
        else
            throw "Unknown mode."
        
        let rejected = false

        socket.on("connect_error", function (e) {
            console.log(e)
            window.location.href = "/"
        })
        socket.on('connect', function () {
            console.log("connect");
            socket.emit("request_join", true)
        });
        socket.on("reject_join", data => {
            rejected = true
            socket.close()
            alert("Cannot join. Game in progress.")
            window.location.href = "/"
        })
        socket.on('get_id', function (data) {
            console.log("ID: " + data.id);
            let seed = data.seed
            Math.seedrandom(seed)
            noise.seed(Math.random())
            main(socket, data.id, data.players, gl, ext)
        });
        socket.on('disconnect', function () {
            console.log("disconnect");
            window.location.href = "/"
        });
        socket.on("echo", (data) => {
            console.log("echo: " + data)
        })

        setTimeout(() => {
            if (!rejected && !socket.connected) {
                socket.close()
                //window.location.href = "/"
                window.alert("Could not connect to server. Starting in single player mode.")
                main(null, null, null, gl, ext)
            }
        }, 1000)
    }
}

function main(socket, playerId, playersAtConnect, gl, ext) {
    const canvas = document.querySelector('#glcanvas');

    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    gl.enable(gl.CULL_FACE);

    canvas.requestPointerLock = canvas.requestPointerLock ||
        canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;

    canvas.onclick = function () {
        canvas.requestPointerLock();
    }

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            //console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", updatePosition, false);
        } else {
            //console.log('The pointer lock status is now unlocked');
            document.removeEventListener("mousemove", updatePosition, false);
        }
    }
    function updatePosition(e) {
        var movementX = e.movementX ||
            e.mozMovementX ||
            e.webkitMovementX ||
            0,
            movementY = e.movementY ||
                e.mozMovementY ||
                e.webkitMovementY ||
                0;
        state.mouse.movementX += movementX
        state.mouse.movementY += movementY
    }

    if (sceneId == 0)
        initMainScene(gl, ext, socket, playerId, playersAtConnect)
    else if (sceneId == 1)
        initTestScene(gl, ext, socket, playerId, playersAtConnect)
    else
        alert("Invalid SceneId.")

    var then = 0;
    function render(now) {
        now *= 0.001;  // convert to seconds
        state.time = now
        const deltaTime = now - then;
        state.deltaTime = deltaTime
        then = now;

        if (!(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas)) {
            for (let key in input.keys) {
                input.keys[key] = false
            }
            for (let key in input.keysDown) {
                input.keysDown[key] = false
            }
            input.mouse.left = false
            input.mouse.right = false
            input.mouseDown.left = false
            input.mouseDown.right = false
        }

        gl.clearColor(fogColor[0], fogColor[1], fogColor[2], fogColor[3]);  // Clear to black, fully opaque

        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        function updateGameObjectPhysics(gameObject) {
            if (gameObject.body != null) {
                gameObject._localPosition = new Vector3(gameObject.body.position.x, gameObject.body.position.z, gameObject.body.position.y)
                gameObject._localRotation = [gameObject.body.quaternion.x, gameObject.body.quaternion.z, -gameObject.body.quaternion.y, gameObject.body.quaternion.w]
                gameObject.calculateModelMatrix()
            }
            gameObject.children.forEach((child) => {
                //updateGameObjectPhysics(child)
                if (child.shapeIndex != null && false) {

                }
                else
                    child.calculateModelMatrix()
            })
        }

        function updateGameObject(gameObject) {
            gameObject.script.update(gameObject, state)
            gameObject.children.forEach((child) => {
                updateGameObject(child)
            })
        }
        let crosshair = null
        function drawGameObject(gameObject) {
            if (gameObject.name != "crosshair") {
                gameObject.drawSelf(gl, ext)
            }
            else
                crosshair = gameObject
            gameObject.children.forEach((child) => {
                drawGameObject(child)
            })
        }

        world.step(1.0 / 60.0, deltaTime, 3);
        gameObjects.forEach((gameObject) => {
            updateGameObjectPhysics(gameObject)
        })
        gameObjects.forEach((gameObject) => {
            updateGameObject(gameObject)
        })
        gameObjects.forEach((gameObject) => {
            drawGameObject(gameObject)
        })
        crosshair.drawSelf(gl, ext)

        state.mouse.movementX = 0
        state.mouse.movementY = 0

        state.input.mouseDown.left = false
        state.input.mouseDown.right = false

        for (let key in state.input.keysDown) {
            state.input.keysDown[key] = false
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}