function initTestScene(gl, ext, socket, playerId, playersAtConnect) {
    const defaultMaterial = newDefaultMaterial(gl, ext)
    const crateMaterial = [
        newDefaultMaterial(gl, ext, textures["crate.jpg"]),
        newDefaultMaterial(gl, ext, textures["crate2.jpg"]),
        newDefaultMaterial(gl, ext, textures["crate3.jpg"]),
        newDefaultMaterial(gl, ext, textures["crate4.png"])
    ]
    const testMaterial = newDefaultMaterial(gl, ext, textures["test.png"])
    const stoneMaterial = newDefaultMaterial(gl, ext, textures["stone.jpg"])
    const unlitMaterial = newUnlitMaterial(gl, ext)

    let t1 = new GameObject(new Vector3(-5, 1.5, 0), quat.create(), Vector3.one)
    t1.initDraw(gl, ext, cubeMesh, crateMaterial[0])
    t1.addBody(1)
    t1.addShape("box")

    let t2 = new GameObject(new Vector3(0, 1, 0), quat.create(), Vector3.one)
    t2.parent = t1
    t2.initDraw(gl, ext, cubeMesh, crateMaterial[0])
    t2.addShape("box")
    t2.script.update = (gameObject, state) => {
        let rotation = gameObject.localRotation
        quat.rotateY(rotation, rotation, 20 * state.deltaTime * Math.PI / 180.0)
        gameObject.localRotation = rotation
    }

    let t3 = new GameObject(new Vector3(1, 0, 0), quat.create(), Vector3.one)
    t3.parent = t2
    t3.initDraw(gl, ext, cubeMesh, crateMaterial[0])
    t3.addShape("box")
    t3.script.update = (gameObject, state) => {
        let rotation = gameObject.localRotation
        quat.rotateX(rotation, rotation, 30 * state.deltaTime * Math.PI / 180.0)
        gameObject.localRotation = rotation
    }

    let cube = new GameObject(new Vector3(10, 4, 0), quatFromEuler(new Vector3(-45, 0, 0)), new Vector3(9.01, 1, 9))
    cube.initDraw(gl, ext, cubeMesh, stoneMaterial)
    cube.addBody(0)
    cube.addShape("box")
    //cube.color = [1, 0.5, 0.5, 1]

    let cube2 = new GameObject(new Vector3(10, 1, -5), quat.create(), new Vector3(9, 1, 4))
    cube2.initDraw(gl, ext, cubeMesh, stoneMaterial)
    cube2.addBody(0)
    cube2.addShape("box")
    //cube2.color = [1, 0.5, 0.5, 1]

    let box = new GameObject(new Vector3(0, 3.5, 0), quat.create(), new Vector3(1, 1, 1))
    box.initDraw(gl, ext, cubeMesh, crateMaterial[0])
    box.color = [0, 1, 0, 1]
    box.addBody(0)
    box.addShape("box")
    box.script.update = (gameObject, state) => {
        let rotation = gameObject.localRotation
        quat.rotateX(rotation, rotation, 30 * Math.PI / 180.0 * state.deltaTime)
        quat.rotateY(rotation, rotation, 60 * Math.PI / 180.0 * state.deltaTime)
        quat.rotateZ(rotation, rotation, 90 * Math.PI / 180.0 * state.deltaTime)
        gameObject.localRotation = rotation
    }

    let box2 = new GameObject(new Vector3(0, 1.5, 0), quat.create(), new Vector3(1, 1, 1))
    box2.initDraw(gl, ext, cubeMesh, unlitMaterial)
    box2.color = [0.2, 0.5, 0.7, 1]
    box2.parent = box
    box2.addShape("box")
    box2.script.update = (gameObject, state) => {
        //gameObject.localEulerAngles.y -= 45 * state.deltaTime
        let rotation = gameObject.localRotation
        quat.rotateY(rotation, rotation, 90 * Math.PI / 180.0 * state.deltaTime)
        gameObject.localRotation = rotation
    }

    let spawnPoint = new GameObject(new Vector3(1.5, 0, 0), quat.create(), new Vector3(1, 1, 1))
    spawnPoint.initDraw(gl, ext, cubeMesh, testMaterial)
    spawnPoint.parent = box2
    spawnPoint.addShape("box")
    spawnPoint.script.update = (gameObject, state) => {
        //gameObject.localEulerAngles.x += 180 * state.deltaTime
        let rotation = gameObject.localRotation
        quat.rotateX(rotation, rotation, 90 * Math.PI / 180.0 * state.deltaTime)
        gameObject.localRotation = rotation
    }

    let ground = new GameObject(new Vector3(-5, -0.5, 0), quat.create(), new Vector3(20, 1, 10))
    ground.initDraw(gl, ext, cubeMesh, defaultMaterial)
    ground.addBody(0)
    ground.addShape("box")

    let player = new GameObject(new Vector3(0, 1, -10), quat.create(), Vector3.one)
    player.script.update = (gameObject, state) => {
        if (state.mouse.movementX != 0) {
            //gameObject.localEulerAngles.y += state.mouse.movementX * 0.1;
            let rotation = quat.create()
            quat.copy(rotation, gameObject.localRotation)
            quat.rotateY(rotation, rotation, -state.mouse.movementX * Math.PI / 180.0 * 0.1)
            gameObject.localRotation = rotation
        }

        let speed = 5
        if (state.input.keys[keyCode.DOM_VK_W])
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.forward, state.deltaTime * speed))
        if (state.input.keys[keyCode.DOM_VK_S])
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.forward, -state.deltaTime * speed))
        if (state.input.keys[keyCode.DOM_VK_D])
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, state.deltaTime * speed))
        if (state.input.keys[keyCode.DOM_VK_A])
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, -state.deltaTime * speed))
    }
    let playerCube = new GameObject(Vector3.zero, quat.create(), new Vector3(0.5, 2, 0.5))
    playerCube.parent = player
    playerCube.initDraw(gl, ext, cubeMesh, defaultMaterial)
    let camera = new GameObject(new Vector3(0, 0.9, 0), quat.create(), Vector3.one)
    //camera.initDraw(gl, ext, cubeMesh, defaultMaterial)
    camera.isCamera = true
    camera.initCameraView()
    Camera.main = camera
    camera.parent = player
    camera.calculateCameraView(gl)
    camera.script.update = (gameObject, state) => {
        let rotation = quat.create()
        quat.copy(rotation, gameObject.localRotation)
        quat.rotateX(rotation, rotation, -state.mouse.movementY * Math.PI / 180.0 * 0.1)

        let angle = Vector3.angle(quatXVector(rotation, Vector3.up), new Vector3(0, 1, 0))
        if (angle < 89)
            gameObject.localRotation = rotation
    }

    function getDog() {
        let dog = new GameObject()

        let dogDraw = new GameObject()
        dogDraw.initDraw(gl, ext, dogMesh, defaultMaterial)
        dogDraw.parent = dog
        dogDraw.color = [139 / 255, 69 / 255, 19 / 255, 1]
        dogDraw.localScale = new Vector3(0.03, 0.03, 0.03)
        dogDraw.localRotation = quatFromEuler(new Vector3(90, 0, 0))
        dogDraw.localPosition.y -= 0.5

        return dog
    }

    function getBall() {
        let ball = new GameObject()

        let ballMesh = new GameObject()
        ballMesh.parent = ball
        let scale = 0.025;
        ballMesh.localScale = new Vector3(scale, scale, scale);
        ballMesh.initDraw(gl, ext, sphereMesh, defaultMaterial)

        return ball
    }

    let mainDog = getDog()
    mainDog.localPosition = new Vector3(-10, 0.5, 0)

    let g = new GameObject()
    g.localPosition = new Vector3(-5, 3.5, 3)
    g.initDraw(gl, ext, cubeMesh, defaultMaterial)
    g.lookAt(mainDog.position)
    g.addBody(1)
    g.velocity = Vector3.multiply(g.forward, 5)
    g.body.preStep = () => {
        g.body.velocity.z -= world.dt * gravity
    }

    let gameManager = new GameObject()
    gameManager.script.lastCubeSpawnTime = -10
    gameManager.script.lastBodySpawnTime = -10
    gameManager.script.update = (gameObject, state) => {
        if (state.input.keys[keyCode.DOM_VK_1]) {
            let dog = getDog()
            dog.localPosition = new Vector3(mainDog.position)
            dog.children[0].color = [Math.random(), Math.random(), Math.random(), 1]

            dog.addBody(1)

            dog.body.velocity = new CANNON.Vec3(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, 5)
            dog.body.angularVelocity = new CANNON.Vec3(Math.random() * 180 * Math.PI / 180.0, Math.random() * 180 * Math.PI / 180.0, Math.random() * 180 * Math.PI / 180.0)

            dog.script.update = (gameObject, state) => {
                if (gameObject.position.y < 0)
                    Destroy(gameObject)
            }
        }
        if (state.input.keys[keyCode.DOM_VK_2] && state.time - gameObject.script.lastCubeSpawnTime > 0.05) {
            gameObject.script.lastCubeSpawnTime = state.time
            let box = new GameObject()
            box.initDraw(gl, ext, cubeMesh, defaultMaterial)
            box.localPosition = new Vector3(spawnPoint.position)
            box.localRotation = spawnPoint.rotation
            box.color = [Math.random(), Math.random(), Math.random(), 1]
            box.addBody(1)

            let forward = box.forward

            box.body.velocity = new CANNON.Vec3(forward.x * 20 + Math.random(), forward.z * 20 + Math.random(), forward.y * 20 + Math.random())

            box.script.update = (gameObject, state) => {
                if (gameObject.position.y < 0)
                    Destroy(gameObject)
            }
        }
        if (state.input.keys[keyCode.DOM_VK_3] && state.time - gameObject.script.lastBodySpawnTime > 0.01) {
            gameObject.script.lastBodySpawnTime = state.time

            let physicsObject = new GameObject()

            physicsObject.localPosition = new Vector3(Math.random() * 5 - 2.5 + 10, 15, Math.random() * 5 - 2.5)

            physicsObject.initDraw(gl, ext, cubeMesh, crateMaterial[Math.floor(Math.random() * crateMaterial.length)])
            physicsObject.addBody(1)
            physicsObject.addShape("box")

            physicsObject.body.velocity = new CANNON.Vec3(0, 0, -10)

            physicsObject.script.update = (gameObject, state) => {
                if (gameObject.position.y < 0)
                    Destroy(gameObject)
            }
        }
        if (state.input.keysDown[keyCode.DOM_VK_4]) {
            //let physicsObject = new GameObject()
            let physicsObject = getBall()
            physicsObject.children[0].color = hslToRgb(Math.random(), 1, 0.4)

            physicsObject.localPosition = new Vector3(10, 20, 0)

            physicsObject.initDraw(gl, ext, sphereMesh, defaultMaterial)
            physicsObject.localScale = new Vector3(8, 8, 8)
            physicsObject.addBody(100)
            physicsObject.addShape("sphere")

            physicsObject.body.velocity = new CANNON.Vec3(0, 0, -100)

            physicsObject.script.update = (gameObject, state) => {
                if (gameObject.position.y < 0)
                    Destroy(gameObject)
            }
        }
        if (state.input.mouseDown.left || state.input.mouse.right) {
            //let bullet = new GameObject()
            let bullet = getBall()
            bullet.localPosition = Vector3.add(camera.position, Vector3.multiply(camera.up, -0.5))
            bullet.localScale = new Vector3(0.4, 0.4, 0.4)

            let mass = 1
            let speed = 50
            //bullet.initDraw(gl, ext, sphereMesh, defaultMaterial)
            if (state.input.mouse.right)
                bullet.children[0].color = [Math.random(), Math.random(), Math.random(), 1]
            else {
                bullet.children[0].color = [1, 1, 0, 1]
                mass = 0.1
                speed = 10
            }
            
            bullet.addBody(mass)
            bullet.addShape("sphere")
            bullet.setVelocity(Vector3.multiply(camera.forward, speed))

            bullet.script.startTime = state.time
            bullet.script.update = (gameObject, state) => {
                if (state.time - gameObject.script.startTime > 3)
                    Destroy(gameObject)
            }
        }
    }

    if (socket != null) {

        function updatePlayer() {
            socket.emit("updatePlayer", {
                p: [player.localPosition.x, player.localPosition.y, player.localPosition.z],
                q: player.localRotation
            })
        }
        updatePlayer()
        setInterval(updatePlayer, 16)

        function createNewPlayer(position, rotation) {
            let player = new GameObject(position, rotation, Vector3.one)
            let playerCube = new GameObject(Vector3.zero, quat.create(), new Vector3(0.5, 2, 0.5))
            playerCube.parent = player
            playerCube.initDraw(gl, ext, cubeMesh, defaultMaterial)
            return player
        }

        let players = {}

        for (let id in playersAtConnect) {
            if (id != playerId) {
                let position = new Vector3(playersAtConnect[id].p[0], playersAtConnect[id].p[1], playersAtConnect[id].p[2])
                players[id] = createNewPlayer(position, playersAtConnect[id].q)
            }
        }

        socket.on("updatePlayers", (data) => {
            for (let id in data) {
                if (id != playerId) {
                    players[id].localPosition = new Vector3(data[id].p[0], data[id].p[1], data[id].p[2])
                    players[id].localRotation = data[id].q
                }
            }
        })
        socket.on("player_connect", (data) => {
            if (data != playerId) {
                console.log("Player connected: " + data)
                players[data] = createNewPlayer(new Vector3(0, 0, 0), quat.create())
            }
        })
        socket.on("player_disconnect", (data) => {
            if (data != playerId) {
                console.log("Player disconnected: " + data)
                Destroy(players[data])
                delete players[data]
            }
        })
    }
}