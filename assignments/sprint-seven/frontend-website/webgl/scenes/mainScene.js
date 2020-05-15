function initMainScene(gl, ext, socket, playerId, playersAtConnect) {
    const defaultMaterial = newDefaultMaterial(gl, ext)
    const testMaterial = newDefaultMaterial(gl, ext, textures["test.png"])
    const stormMaterial = newStormMaterial(gl, ext, textures["sand.jpg"])
    const stoneMaterial = newDefaultMaterial(gl, ext, textures["stone.jpg"])
    const sandMaterial = newDefaultMaterial(gl, ext, textures["sand.jpg"])
    const tankMaterial = newDefaultMaterial(gl, ext, textures["tank.jpg"])
    const tankTracksMaterial = newTankTreadsMaterial(gl, ext, textures["tracks.jpg"])
    const tankTracksMaterialStatic = newDefaultMaterial(gl, ext, textures["tracks.jpg"])
    const crosshairMaterial = newCrosshairMaterial(gl, ext, textures["crosshair.png"])
    const profileMaterial = newCrosshairMaterial(gl, ext, textures["profile.jpg"], false)
    const flashMaterial = newCrosshairMaterial(gl, ext, textures["flash.png"])
    const palmMaterial = newDefaultMaterial(gl, ext, textures["palm.jpg"])
    const wallMaterial = newDefaultMaterial(gl, ext, textures["wall.jpg"])

    function getProfileMaterial(profilePictureUrl) {
        function isPowerOf2(value) {
            return (value & (value - 1)) == 0;
        }
        let image = new Image()
        let texture = gl.createTexture()
        image.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
                //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        })
        image.crossOrigin = "anonymous"
        image.src = profilePictureUrl
        const material = newCrosshairMaterial(gl, ext, texture, false)
        return material
    }

    var noFrictionMaterial = new CANNON.Material();
    noFrictionMaterial.friction = 0
    noFrictionMaterial.restitution = 0

    let stormRadius = 300

    let players = {}
    let gameStarted = false
    let gameStartTime = 0
    let safeRadius = stormRadius

    function getPalm() {
        let palm = new GameObject()
        palm.addBody(0)

        let palmDraw = new GameObject()
        palmDraw.parent = palm
        palmDraw.initDraw(gl, ext, palmMesh, palmMaterial)
        palmDraw.localScale = new Vector3(0.04, 0.04, 0.04)
        palmDraw.localPosition.y -= 1
        palmDraw.rotateY(Math.random() * 360)
        palmDraw.rotateX(Math.random() * 15 - 7.5)
        palmDraw.rotateZ(Math.random() * 15 - 7.5)

        let palmPhysics = new GameObject()
        palmPhysics.parent = palm
        palmPhysics.localScale = new Vector3(1.5, 20, 1.5)
        palmPhysics.localPosition.y = 9
        //palmPhysics.initDraw(gl, ext, cubeMesh, defaultMaterial)
        palmPhysics.addShape("box")

        return palm
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

    size = new Vector3(200, 0, 200)

    function getGroundObject(position) {
        let groundMesh = getGroundMesh(position, false)
        let ground = new GameObject()
        //ground.color = [Math.random(), Math.random(), Math.random(), 1]
        ground.localPosition = position
        ground.initDraw(gl, ext, groundMesh.mesh, sandMaterial)
        ground.addBody(0)
        ground.addShape("heightfield", groundMesh.matrix);
        ground.shape.material = noFrictionMaterial
        ground.body.material = noFrictionMaterial

        return ground
    }

    for (let x = 0; x < 3; x++)
        for (let z = 0; z < 3; z++)
            getGroundObject(new Vector3(x * size.x, 0, z * size.z))

    for (let i = 0; i < 75; i++) {
        let palm = getPalm()
        let x = Math.random() * stormRadius * 2
        let z = Math.random() * stormRadius * 2
        let y = getTerrainHeight(x, z)
        palm.localPosition = new Vector3(x, y, z)
    }

    for (let i = 0; i < 75; i++) {
        let wall = new GameObject()
        wall.localScale = new Vector3(Math.random() * 25 + 10, Math.random() * 10 + 5, 1)
        wall.initDraw(gl, ext, cubeMesh, wallMaterial)
        wall.addBody(0)
        wall.addShape("box")
        let x = Math.random() * stormRadius * 2
        let z = Math.random() * stormRadius * 2
        let y = getTerrainHeight(x, z)
        wall.localPosition = new Vector3(x, y, z)
        wall.rotateY(Math.random() * 360)
    }

    var d = new Date();
    var n = d.getTime();
    Math.seedrandom(n)

    let storm = new GameObject()
    storm.localPosition = new Vector3(stormRadius, 200, stormRadius)
    storm.localScale = new Vector3(stormRadius * 2, stormRadius * 2, stormRadius * 2)
    storm.initDraw(gl, ext, cylinderMesh, stormMaterial)
    storm.script.update = (gameObject, state) => {
        if (gameStarted) {
            let matchTime = state.time - gameStartTime
            let progress = 1 - matchTime / (60 * 2)
            if (progress < 0)
                progress = 0
            safeRadius = stormRadius * progress
            gameObject.localScale.x = stormRadius * 2 * progress
            gameObject.localScale.z = stormRadius * 2 * progress
        }
    }

    function getTank(hasPhysics) {
        let tank = new GameObject()
        //tank.initDraw(gl, ext, cubeMesh, defaultMaterial)
        if (hasPhysics)
            tank.addBody(50000)
        else
            tank.addBody(0)
        //tank.body.linearDamping = 0.8
        //tank.body.angularDamping = 0.9

        let tankBody = new GameObject()
        tankBody.localPosition = new Vector3(1.75, -1, 0)
        tankBody.parent = tank
        tankBody.initDraw(gl, ext, tankMesh, tankMaterial)


        let tankBodyHitBox = new GameObject()
        tankBodyHitBox.localPosition = new Vector3(-1.75, 1.5, 0)
        tankBodyHitBox.localScale = new Vector3(7, 3, 4)
        tankBodyHitBox.parent = tankBody
        //tankBodyHitBox.initDraw(gl, ext, cubeMesh, defaultMaterial)
        tankBodyHitBox.addShape("box")
        tankBodyHitBox.shape.material = noFrictionMaterial

        let tankTracks = new GameObject()
        tankTracks.localPosition = new Vector3(1.75, -1, 0)
        tankTracks.parent = tank
        if (hasPhysics)
            tankTracks.initDraw(gl, ext, tankTracksMesh, tankTracksMaterial)
        else
            tankTracks.initDraw(gl, ext, tankTracksMesh, tankTracksMaterialStatic)

        let turret = new GameObject()
        turret.parent = tankBody
        turret.localPosition = new Vector3(-1.65, 2.65, 0)
        turret.initDraw(gl, ext, turretMesh, tankMaterial)

        let barrel = new GameObject()
        barrel.parent = turret
        barrel.localPosition = new Vector3(1.8, -0.05, 0)
        barrel.initDraw(gl, ext, barrelMesh, tankMaterial)

        return {
            tank: tank,
            turret: turret,
            barrel: barrel
        }
    }

    // let targetBall = getBall()
    // targetBall.children[0].color = [1, 0, 0, 1]
    // targetBall.localScale = new Vector3(1, 1, 1)

    let tankParts = getTank(true)
    let tank = tankParts.tank
    let turret = tankParts.turret
    let barrel = tankParts.barrel

    // let profilePicture = new GameObject()
    // let pScale = 2
    // profilePicture.localScale = new Vector3(pScale, pScale, 1)
    // profilePicture.color = [0, 0, 0, 0.75]
    // profilePicture.initDraw(gl, ext, quadMesh, getProfileMaterial(googleUserImageUrl))
    // profilePicture.script.update = (gameObject, state) => {
    //     gameObject.localPosition = tank.position
    //     gameObject.localPosition.y += 7.5
    //     let lookPos = Vector3.zero
    //     if (camera)
    //         lookPos = new Vector3(camera.position)
    //     gameObject.lookAt(lookPos)
    //     gameObject.rotateY(180)
    //     gameObject.rotateZ(180)
    // }

    let flash = new GameObject()
    flash.parent = barrel
    flash.localRotation = quatFromEuler(new Vector3(0, 90, 0))
    flash.localPosition = new Vector3(8, 0, 0)
    flash.localScale = new Vector3(1, 1, 1.5)
    flash.initDraw(gl, ext, flashMesh, flashMaterial)
    flash.enabled = false

    function getExplosion() {
        let explosion = new GameObject()
        explosion.localRotation = quatFromEuler(new Vector3(90, 0, 0))
        explosion.localPosition = new Vector3(0, 0, 0)
        explosion.localScale = new Vector3(5, 5, 3)
        explosion.initDraw(gl, ext, flashMesh, flashMaterial)
        explosion.script.spawnTime = state.time
        explosion.script.update = (gameObject, state) => {
            if (state.time - gameObject.script.spawnTime > 0.1)
                Destroy(gameObject)
        }
        return explosion
    }

    //console.log(tank.body.collisionResponse)

    let radius = 50
    let r = Math.random() * radius * radius
    let theta = Math.random() * 2 * Math.PI
    let position = new Vector3(Math.sqrt(r) * Math.cos(theta) + stormRadius, 100, Math.sqrt(r) * Math.sin(theta) + stormRadius)
    tank.localPosition = position
    tank.localPosition = new Vector3(tank.localPosition.x, getTerrainHeight(tank.localPosition.x, tank.localPosition.z) + 3, tank.localPosition.z)
    tank.script.result = new CANNON.RaycastResult()
    tank.script.turretAngle = 0
    tank.script.barrelAngle = 0
    playerMoving = false
    playerMovingBackwards = false
    let lastFireTime = 0
    tank.script.update = (gameObject, state) => {
        if (tank == null)
            return
        let px = tank.position.x - stormRadius
        let pz = tank.position.z - stormRadius
        let tankDistance = Math.sqrt(px * px + pz * pz)
        if (tankDistance > safeRadius) {
            socket.emit("die", playerId)
        }
        if (state.input.keys[keyCode.DOM_VK_W]) {
            //tank.body.linearDamping = 0.8
            let yVelocity = gameObject.body.velocity.z
            gameObject.setVelocity(Vector3.zero)
            gameObject.body.velocity.z = yVelocity
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, state.deltaTime * 10))
        }
        if (state.input.keys[keyCode.DOM_VK_S]) {
            //tank.body.linearDamping = 0.8
            let yVelocity = gameObject.body.velocity.z
            gameObject.setVelocity(Vector3.zero)
            gameObject.body.velocity.z = yVelocity
            gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, state.deltaTime * -10))
        }
        if (!state.input.keys[keyCode.DOM_VK_W] && !state.input.keys[keyCode.DOM_VK_S]) {
            //tank.body.linearDamping = 0.999
        }
        if (state.input.keys[keyCode.DOM_VK_A]) {
            gameObject.rotateY(state.deltaTime * 80)
        }
        if (state.input.keys[keyCode.DOM_VK_D]) {
            gameObject.rotateY(-state.deltaTime * 80)
        }
        if (state.input.keys[keyCode.DOM_VK_S]) {
            playerMovingBackwards = true
        }
        else {
            playerMovingBackwards = false
        }
        if (state.input.keys[keyCode.DOM_VK_W] ||
            state.input.keys[keyCode.DOM_VK_A] ||
            state.input.keys[keyCode.DOM_VK_S] ||
            state.input.keys[keyCode.DOM_VK_D]) {
            noFrictionMaterial.friction = 0
            playerMoving = true
        }
        else {
            noFrictionMaterial.friction = 1
            playerMoving = false
        }
        let from = vectorToBodyVector(crosshair.position)
        let to = vectorToBodyVector(Vector3.add(crosshair.position, Vector3.multiply(crosshair.forward, 250)))
        let options = {}
        tank.script.result.reset()
        let hit = world.raycastClosest(from, to, options, tank.script.result)
        let target = Vector3.add(crosshair.position, Vector3.multiply(crosshair.forward, 25))
        //console.log(hit)
        if (hit) {
            let hitPos = bodyVectorToVector(tank.script.result.hitPointWorld)
            target = hitPos
        }
        //targetBall.localPosition = target

        let targetRelative = Vector3.subtract(target, turret.position)
        let inverseTankRotation = quat.create()
        quat.invert(inverseTankRotation, tank.rotation)
        targetRelative = quatXVector(inverseTankRotation, targetRelative, false)

        let angleY = Math.atan2(targetRelative.z, targetRelative.x)
        let direction = shortAngleDist(tank.script.turretAngle, angleY)
        let difference = Math.abs(tank.script.turretAngle - angleY)
        let step = 90 * state.deltaTime * Math.PI / 180
        if (difference <= step) {
            tank.script.turretAngle = angleY
        }
        else {
            if (direction > 0)
                tank.script.turretAngle += step
            else if (direction < 0)
                tank.script.turretAngle -= step
        }
        let rotation = quat.create()
        quat.setAxisAngle(rotation, [0, 1, 0], tank.script.turretAngle)
        turret.localRotation = rotation

        let angleZ = Math.atan2(targetRelative.y, Math.sqrt(targetRelative.x * targetRelative.x + targetRelative.z * targetRelative.z))
        direction = shortAngleDist(tank.script.barrelAngle, angleZ)
        difference = Math.abs(tank.script.barrelAngle - angleZ)
        if (difference <= step) {
            tank.script.barrelAngle = angleZ
        }
        else {
            if (direction > 0)
                tank.script.barrelAngle += step
            else if (direction < 0)
                tank.script.barrelAngle -= step
        }
        let barrelRotation = quat.create()
        quat.setAxisAngle(barrelRotation, [0, 0, 1], tank.script.barrelAngle)
        barrel.localRotation = barrelRotation

        if (state.input.mouseDown.left) {
            if (state.time - lastFireTime > 2) {
                lastFireTime = state.time
                flash.enabled = true

                from = vectorToBodyVector(flash.position)
                to = vectorToBodyVector(Vector3.add(flash.position, Vector3.multiply(barrel.right, 250)))
                options = {}
                tank.script.result.reset()
                hit = world.raycastClosest(from, to, options, tank.script.result)

                //targetBall.localPosition = bodyVectorToVector(tank.script.result.hitPointWorld)

                if (hit) {
                    for (let key in players) {
                        if (players[key].tank.body.id == tank.script.result.body.id) {
                            //console.log(players[key].tank)
                            socket.emit("hit", key)
                        }
                    }
                }
            }
        }
        if (state.time - lastFireTime > 0.1)
            flash.enabled = false
    }

    // for (let i = 0; i < 20; i++) {
    //     let r = Math.random() * stormRadius * stormRadius
    //     let theta = Math.random() * 2 * Math.PI
    //     let position = new Vector3(Math.sqrt(r) * Math.cos(theta) + stormRadius, 0, Math.sqrt(r) * Math.sin(theta) + stormRadius)
    //     let tankHeight = getTerrainHeight(position.x, position.z) + 0
    //     position.y = tankHeight
    //     let randTank = getTank(false).tank
    //     randTank.localPosition = position
    //     randTank.rotateY(Math.random() * 360)
    // }

    let cameraOffset = new Vector3(0, 0, -12.5)

    let playerTankPivotBase = new GameObject()
    playerTankPivotBase.script.update = (gameObject, state) => {
        if (tank != null)
            playerTankPivotBase.localPosition = tank.position
    }

    let playerTankPivotPoint = new GameObject()
    playerTankPivotPoint.localPosition = new Vector3(0, 3.5, 0)
    playerTankPivotPoint.parent = playerTankPivotBase

    let playerTankPivot = new GameObject()
    playerTankPivot.rotateY(-90)
    playerTankPivot.script.update = (gameObject, state) => {
        playerTankPivot.localPosition = playerTankPivotPoint.position
        if (state.mouse.movementX != 0) {
            gameObject.rotateY(-state.mouse.movementX * 0.1)
        }
    }

    let playerTankPivotCameraHolder = new GameObject()
    playerTankPivotCameraHolder.parent = playerTankPivot
    playerTankPivotCameraHolder.script.update = (gameObject, state) => {
        playerTankPivot.localPosition = playerTankPivotPoint.position
        if (state.mouse.movementY != 0) {
            //gameObject.rotateX(-state.mouse.movementY * 0.1)
            let rotation = quat.create()
            quat.copy(rotation, gameObject.localRotation)
            quat.rotateX(rotation, rotation, -state.mouse.movementY * Math.PI / 180.0 * 0.1)

            let angle = Vector3.angle(quatXVector(rotation, Vector3.up), new Vector3(0, 1, 0))
            if (angle < 60)
                gameObject.localRotation = rotation
        }
    }

    function spectate() {
        player.parent = null
        player.script.spectateMode = true
        //crosshair.parent = null
        crosshair.enabled = false
    }

    let player = new GameObject(new Vector3(0, 1, -5), quat.create(), Vector3.one)
    player.parent = playerTankPivotCameraHolder
    player.localPosition = new Vector3(0, 3, -15)
    player.script.spectateMode = false
    player.script.dev = false

    player.script.update = (gameObject, state) => {
        if (player.script.spectateMode) {
            if (state.mouse.movementX != 0) {
                let rotation = quat.create()
                quat.copy(rotation, gameObject.localRotation)
                quat.rotateY(rotation, rotation, -state.mouse.movementX * Math.PI / 180.0 * 0.1)
                gameObject.localRotation = rotation
            }
            let speed = 100
            if (state.input.keys[keyCode.DOM_VK_W])
                gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.forward, state.deltaTime * speed))
            if (state.input.keys[keyCode.DOM_VK_S])
                gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.forward, -state.deltaTime * speed))
            if (state.input.keys[keyCode.DOM_VK_D])
                gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, state.deltaTime * speed))
            if (state.input.keys[keyCode.DOM_VK_A])
                gameObject.localPosition = Vector3.add(gameObject.localPosition, Vector3.multiply(gameObject.right, -state.deltaTime * speed))
            if (state.input.keys[keyCode.DOM_VK_SPACE])
                gameObject.localPosition.y += state.deltaTime * speed
            if (state.input.keys[keyCode.DOM_VK_SHIFT])
                gameObject.localPosition.y -= state.deltaTime * speed
        }
        else {
            player.localPosition = cameraOffset
        }
        if (player.script.dev && (state.input.mouseDown.left || state.input.mouse.right)) {
            //let bullet = new GameObject()
            let bullet = getBall()
            bullet.localPosition = Vector3.add(camera.position, Vector3.multiply(camera.up, -0.5))
            //bullet.localScale = new Vector3(0.4, 0.4, 0.4)

            let mass = 10000
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
                if (state.time - gameObject.script.startTime > 10)
                    Destroy(gameObject)
            }
        }
    }
    let playerCube = new GameObject()
    //scale: new Vector3(0.5, 2, 0.5)
    playerCube.parent = player
    //playerCube.initDraw(gl, ext, cubeMesh, defaultMaterial)
    let camera = new GameObject(new Vector3(0, 0.9, 0), quat.create(), Vector3.one)
    camera.isCamera = true
    camera.initCameraView()
    Camera.main = camera
    camera.parent = player
    camera.calculateCameraView(gl)
    camera.script.update = (gameObject, state) => {
        if (player.script.spectateMode) {
            let rotation = quat.create()
            quat.copy(rotation, gameObject.localRotation)
            quat.rotateX(rotation, rotation, -state.mouse.movementY * Math.PI / 180.0 * 0.1)

            let angle = Vector3.angle(quatXVector(rotation, Vector3.up), new Vector3(0, 1, 0))
            if (angle < 89)
                gameObject.localRotation = rotation
        }
    }

    let crosshair = new GameObject()
    crosshair.name = "crosshair"
    let crosshairSize = 0.5
    crosshair.localScale = new Vector3(crosshairSize, crosshairSize, crosshairSize)
    crosshair.parent = playerCube
    crosshair.localPosition = new Vector3(0, 0.9, 10)
    crosshair.initDraw(gl, ext, quadMesh, crosshairMaterial)

    const startHealth = 3
    let health = startHealth

    if(socket == null) {
        $("#info").html("")
    }

    if (socket != null) {

        function updatePlayer() {
            if (tank == null) {
                socket.emit("updatePlayer", {
                    p: [0, 0, 0],
                    q: [0, 0, 0, 1],
                    t: 0,
                    b: 0,
                    alive: tank != null
                })
            }
            else {
                socket.emit("updatePlayer", {
                    p: [tank.position.x, tank.position.y, tank.position.z],
                    q: tank.rotation,
                    t: tank.script.turretAngle,
                    b: tank.script.barrelAngle,
                    alive: tank != null
                })
            }
        }
        updatePlayer()
        setInterval(updatePlayer, 16)

        function createNewPlayer(position, rotation, imageUrl) {
            let player = getTank(false)
            player.tank.body.type = CANNON.Body.KINEMATIC
            //player.tank.body.mass = 0
            player.localPosition = position
            player.localRotation = rotation

            let profilePicture = new GameObject()
            let pScale = 2
            profilePicture.localScale = new Vector3(pScale, pScale, 1)
            profilePicture.color = [0, 0, 0, 0.75]
            profilePicture.initDraw(gl, ext, quadMesh, getProfileMaterial(imageUrl))
            profilePicture.script.update = (gameObject, state) => {
                if (player == null || player.tank == null) {
                    Destroy(gameObject)
                }
                else {
                    gameObject.localPosition = player.tank.position
                    gameObject.localPosition.y += 7.5
                    let lookPos = Vector3.zero
                    if (camera)
                        lookPos = new Vector3(camera.position)
                    gameObject.lookAt(lookPos)
                    gameObject.rotateY(180)
                    gameObject.rotateZ(180)
                }
            }

            return player
        }

        console.log(playersAtConnect)

        for (let id in playersAtConnect.playersAtConnect) {
            if (id != playerId) {
                let position = new Vector3(playersAtConnect.playersAtConnect[id].p[0], playersAtConnect.playersAtConnect[id].p[1], playersAtConnect.playersAtConnect[id].p[2])
                players[id] = createNewPlayer(position, playersAtConnect.playersAtConnect[id].q, playersAtConnect.playersImages[id])
            }
        }

        socket.on("starting_soon", data => {
            let timeLeft = data / 1000
            $("#info").html((Object.keys(players).length + 1) + " players. Starting in " + timeLeft + " seconds or less.")
            numPlayersInterval = setInterval(() => {
                //timeLeft -= 0.1
                $("#info").html((Object.keys(players).length + 1) + " players. Starting in " + timeLeft + " seconds or less.")
            }, 100)
        })

        socket.on("updatePlayers", (data) => {
            for (let id in data) {
                if (id != playerId && players[id].tank != null) {
                    players[id].tank.localPosition = new Vector3(data[id].p[0], data[id].p[1], data[id].p[2])
                    players[id].tank.localRotation = data[id].q

                    let rotation = quat.create()
                    quat.setAxisAngle(rotation, [0, 1, 0], data[id].t)
                    players[id].turret.localRotation = rotation

                    let barrelRotation = quat.create()
                    quat.setAxisAngle(barrelRotation, [0, 0, 1], data[id].b)
                    players[id].barrel.localRotation = barrelRotation
                }
            }
        })
        socket.on("player_connect", (data) => {
            if (data.id != playerId) {
                console.log("Player connected: " + data.id)
                players[data.id] = createNewPlayer(new Vector3(0, 0, 0), quat.create(), data.imageUrl)
            }
        })
        socket.on("player_disconnect", (data) => {
            if (data != playerId) {
                if (players[data].tank != null)
                    Destroy(players[data].tank)
                delete players[data]
            }
        })
        socket.on("game_over", data => {
            $("#info").html("Game over. Restarting soon...")
        })
        socket.on("reset_game", data => {
            window.location.href = "/game"
        })
        socket.on("start_game", (data) => {
            console.log('Game Starting.')

            clearInterval(numPlayersInterval)

            health = startHealth
            gameStarted = true
            gameStartTime = state.time

            $("#info").html("")

            tank.localRotation = quatFromEuler(Vector3.zero)
            tank.setVelocity(Vector3.zero)
            tank.body.angularVelocity = new CANNON.Vec3(0, 0, 0)
            let radius = stormRadius - 10
            let r = Math.random() * radius * radius
            let theta = Math.random() * 2 * Math.PI
            let position = new Vector3(Math.sqrt(r) * Math.cos(theta) + stormRadius, 100, Math.sqrt(r) * Math.sin(theta) + stormRadius)
            tank.localPosition = position
            tank.localPosition = new Vector3(tank.localPosition.x, getTerrainHeight(tank.localPosition.x, tank.localPosition.z) + 3, tank.localPosition.z)
            playerTankPivot.localRotation = quatFromEuler(new Vector3(0, 270, 0))
            playerTankPivotCameraHolder.localRotation = quatFromEuler(Vector3.zero)
        })
        socket.on("hit", data => {
            console.log("Hit: " + data)

            let explosion = getExplosion()

            if (playerId == data) {
                explosion.localPosition = tank.position
                health--
                if (health <= 0) {
                    socket.emit("die", data)
                }
            }
            else {
                explosion.localPosition = players[data].tank.position
            }
            explosion.localPosition.y += 5
        })
        socket.on("die", data => {
            if (gameStarted) {
                if (data == playerId) {
                    let position = new Vector3(player.position)
                    let rotation = player.rotation
                    Destroy(tank)
                    tank = null
                    spectate()
                    player.localPosition = position
                    //player.localRotation = rotation
                    $("#info").html("You have died. Entering spectator mode.")
                }
                else {
                    //console.log(players[data].tank)
                    //players[data].tank.children[0].enabled = false
                    //Destroy(players[data].tank)
                    if (players[data].tank != null) {
                        Destroy(players[data].tank)
                        players[data].tank = null
                    }
                }
            }
            else {
                if (data == playerId) {
                    health = startHealth
                    let r = Math.random() * radius * radius
                    let theta = Math.random() * 2 * Math.PI
                    let position = new Vector3(Math.sqrt(r) * Math.cos(theta) + stormRadius, 100, Math.sqrt(r) * Math.sin(theta) + stormRadius)
                    tank.localPosition = position
                    tank.localPosition = new Vector3(tank.localPosition.x, getTerrainHeight(tank.localPosition.x, tank.localPosition.z) + 3, tank.localPosition.z)
                    tank.localRotation = quat.create()
                    playerTankPivot.localRotation = quatFromEuler(new Vector3(0, 270, 0))
                    playerTankPivotCameraHolder.localRotation = quatFromEuler(Vector3.zero)
                    tank.setVelocity(Vector3.zero)
                }
            }
        })
    }
}

function shortAngleDist(a0, a1) {
    var max = Math.PI * 2;
    var da = (a1 - a0) % max;
    return 2 * da % max - da;
}

function getNoiseHeight(position, noiseScale, heightScale, offsetX, offsetZ) {
    let x = position[0]
    let z = position[1]

    if (offsetX == undefined)
        x += 10000
    else
        x += offsetX
    if (offsetZ == undefined)
        z += 10000
    else
        z += offsetZ

    x *= noiseScale
    z *= noiseScale

    let height = (noise.simplex2(x, z) + 1) / 2
    height *= heightScale
    return height
}

function getTerrainHeight(x, z) {
    return getNoiseHeight([x, z], 0.002, 15, 2000, 2000) + getNoiseHeight([x, z], 0.004, 15, 5000, 5000) + getNoiseHeight([x, z], 0.0325, 1) + getNoiseHeight([x, z], 0.005, 22.5)
}

function getGroundMesh(position, flip) {
    let vertices = []
    let triangles = []
    let vertexNormals = []
    let uv = []

    let matrix = []

    let textureTiling = 10

    let dimensions = size;

    for (let i = 0, x = 0; x < dimensions.x + 1; x++) {
        matrix.push([])
        for (let z = 0; z < dimensions.z + 1; z++) {
            let xpos = position.x + x / dimensions.x * size.x;
            let zpos = position.z + z / dimensions.z * size.z;

            let height = getTerrainHeight(xpos, zpos)
            //let height = getNoiseHeight([xpos, zpos], 0.005, 30)
            //height = 1
            matrix[x].push(height)

            vertices[i * 3 + 0] = x / dimensions.x * size.x
            vertices[i * 3 + 1] = height
            vertices[i * 3 + 2] = -z / dimensions.z * size.z

            vertexNormals[i * 3 + 0] = 0
            vertexNormals[i * 3 + 1] = 0
            vertexNormals[i * 3 + 2] = 0

            uv[i * 2 + 0] = x / dimensions.x * textureTiling
            uv[i * 2 + 1] = z / dimensions.z * textureTiling

            i++
        }
    }

    //triangles
    for (let i = 0, x = 0; x < dimensions.x; x++) {
        for (let z = 0; z < dimensions.z; z++) {
            //create square:

            let zRowLength = dimensions.z + 1;
            let selectZRowIndex = x * zRowLength;
            let selectPositionInZRow = selectZRowIndex + z;

            //create triangle 1 of square
            let squareIndex = i * 6;
            triangles[squareIndex] = selectPositionInZRow;
            triangles[squareIndex + 1 + (flip ? 0 : 1)] = selectPositionInZRow + 1;
            triangles[squareIndex + 2 - (flip ? 0 : 1)] = selectPositionInZRow + zRowLength + 1;

            //create triangle 2 of square
            triangles[squareIndex + 3] = selectPositionInZRow;
            triangles[squareIndex + 4 + (flip ? 0 : 1)] = selectPositionInZRow + zRowLength + 1;
            triangles[squareIndex + 5 - (flip ? 0 : 1)] = selectPositionInZRow + zRowLength;

            i++;
        }
    }

    //calculate smooth normals
    for (let i = 0; i < triangles.length; i += 3) {
        let p1Index = triangles[i + 0]
        let p2Index = triangles[i + 1]
        let p3Index = triangles[i + 2]
        let p1 = [vertices[p1Index * 3 + 0], vertices[p1Index * 3 + 1], vertices[p1Index * 3 + 2]]
        let p2 = [vertices[p2Index * 3 + 0], vertices[p2Index * 3 + 1], vertices[p2Index * 3 + 2]]
        let p3 = [vertices[p3Index * 3 + 0], vertices[p3Index * 3 + 1], vertices[p3Index * 3 + 2]]
        let v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
        let v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]]
        let normal = [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]]

        vertexNormals[p1Index * 3 + 0] += normal[0]
        vertexNormals[p1Index * 3 + 1] += normal[1]
        vertexNormals[p1Index * 3 + 2] += normal[2]

        vertexNormals[p2Index * 3 + 0] += normal[0]
        vertexNormals[p2Index * 3 + 1] += normal[1]
        vertexNormals[p2Index * 3 + 2] += normal[2]

        vertexNormals[p3Index * 3 + 0] += normal[0]
        vertexNormals[p3Index * 3 + 1] += normal[1]
        vertexNormals[p3Index * 3 + 2] += normal[2]
    }

    for (let i = 0; i < vertexNormals.length; i += 3) {
        let magnitude = Math.sqrt(vertexNormals[i + 0] * vertexNormals[i + 0] + vertexNormals[i + 1] * vertexNormals[i + 1] + vertexNormals[i + 2] * vertexNormals[i + 2])
        vertexNormals[i + 0] /= magnitude
        vertexNormals[i + 1] /= magnitude
        vertexNormals[i + 2] /= magnitude
    }

    return {
        mesh: {
            vertices: vertices,
            indices: triangles,
            vertexNormals: vertexNormals,
            textures: uv
        },
        matrix: matrix
    }
}