let world = new CANNON.World()
let gravity = -9.80655
world.gravity.set(0, 0, gravity)

class Vector3 {
    constructor(x, y, z) {
        //passing in another Vector3
        if (x != undefined && y === undefined && z === undefined) {
            z = x.z;
            y = x.y;
            x = x.x;
        }
        //passing in nothing sets all values to 0
        else if (x === undefined || y === undefined || z === undefined) {
            x = 0;
            y = 0;
            z = 0;
        }
        this._x = x;
        this._y = y;
        this._z = z;

        this.gameObject = null
    }

    magnitude() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z)
    }

    normalize() {
        let magnitude = this.magnitude()
        this._x /= magnitude
        this._y /= magnitude
        this._z /= magnitude
        return this
    }

    onUpdate() {
        if (this.gameObject != null) {
            if (this.gameObject.body != null)
                throw "Cannot change part of position of GameObject with physics body. Try setting all parts of the position at once."
            this.gameObject.calculateModelMatrix()
        }
    }

    set x(x) {
        if (this._x == x)
            return
        this._x = x
        this.onUpdate()
    }
    set y(y) {
        if (this._y == y)
            return
        this._y = y
        this.onUpdate()
    }
    set z(z) {
        if (this._z == z)
            return
        this._z = z
        this.onUpdate()
    }

    get x() {
        return this._x
    }
    get y() {
        return this._y
    }
    get z() {
        return this._z
    }

    get a() {
        return [this._x, this._y, this._z]
    }

    toString() {
        return "[" + this._x + ", " + this._y + ", " + this._z + "]";
    }

    static get zero() {
        return new Vector3()
    }
    static get one() {
        return new Vector3(1, 1, 1)
    }
    static get forward() {
        return new Vector3(0, 0, 1)
    }
    static get up() {
        return new Vector3(0, 1, 0)
    }
    static get right() {
        return new Vector3(1, 0, 0)
    }

    static multiply(v, a) {
        return new Vector3(v.x * a, v.y * a, v.z * a)
    }

    static add(v1, v2) {
        return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z)
    }

    static subtract(v1, v2) {
        return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z)
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
    }

    static angle(v1, v2) {
        return Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude())) * 180 / Math.PI
    }
}

function eulerAnglesFromMatrix(model) {
    let x = Math.atan2(model[9], model[10]) * 180 / Math.PI
    let y = Math.atan2(-model[8], Math.sqrt(model[9] * model[9] + model[10] * model[10])) * 180 / Math.PI
    let z = -Math.atan2(model[4], model[0]) * 180 / Math.PI
    return new Vector3(x, y, z)
}

function quatToEuler(rotation) {

    var qz = rotation[2];
    var qx = rotation[0];
    var qy = rotation[1];
    var qw = rotation[3];

    var sqw = qw * qw;
    var sqz = qz * qz;
    var sqx = qx * qx;
    var sqy = qy * qy;

    var zAxisY = qy * qz - qx * qw;
    var limit = .4999999;

    //console.log(zAxisY)

    let result = Vector3.zero
    //result.x = 1
    //console.log(result)

    if (zAxisY < -limit) {
        result.y = 2 * Math.atan2(qy, qw);
        result.x = Math.PI / 2;
        result.z = 0;
    } else if (zAxisY > limit) {
        result.y = 2 * Math.atan2(qy, qw);
        result.x = -Math.PI / 2;
        result.z = 0;
    } else {
        result.z = Math.atan2(2.0 * (qx * qy + qz * qw), (-sqz - sqx + sqy + sqw));
        result.x = Math.asin(-2.0 * (qz * qy - qx * qw));
        result.y = Math.atan2(2.0 * (qz * qx + qy * qw), (sqz - sqx - sqy + sqw));
    }

    return new Vector3(result.x * 180 / Math.PI, result.y * 180 / Math.PI, result.z * 180 / Math.PI)
}

function quatFromEuler(v) {
    let rotation = quat.create()
    quat.rotateX(rotation, rotation, -v.x * Math.PI / 180.0)
    quat.rotateY(rotation, rotation, v.y * Math.PI / 180.0)
    quat.rotateZ(rotation, rotation, -v.z * Math.PI / 180.0)
    return rotation
}

function quatToBodyQuat(quaternion) {
    return new CANNON.Quaternion(quaternion[0], -quaternion[2], quaternion[1], quaternion[3])
}
function bodyQuatToQuat(bodyQuaternion) {
    return quat.fromValues(bodyQuaternion.x, bodyQuaternion.z, -bodyQuaternion.y, bodyQuaternion.w)
}

function vectorToBodyVector(vector) {
    return new CANNON.Vec3(vector.x, vector.z, vector.y)
}
function bodyVectorToVector(vector) {
    return new Vector3(vector.x, vector.z, vector.y)
}

function quatXVector(quaternion, vector, normalize) {
    let model = mat4.create()
    mat4.fromQuat(model, quaternion)

    let direction = vec4.create()
    direction[0] = vector.x
    direction[1] = vector.y
    direction[2] = -vector.z
    direction[3] = 1
    mat4.multiply(direction, model, direction)
    direction = new Vector3(direction[0], direction[1], -direction[2])
    if (normalize == undefined || normalize == true)
        direction.normalize()
    return direction
}

let gameObjects = []
let Camera = {
    main: null
}

class GameObject {
    constructor(localPosition, localRotation, localScale) {
        if (localPosition === undefined || localRotation === undefined || localScale === undefined) {
            localPosition = Vector3.zero
            localRotation = quat.create()
            localScale = Vector3.one
        }
        this._localPosition = localPosition;
        this._localRotation = localRotation;
        this._localScale = localScale;

        this._localPosition.gameObject = this
        this._localScale.gameObject = this

        this._body = null
        this.shapeIndex = null

        this._parent = null
        this.children = []

        this.name = "GameObject"
        this.draw = null

        this.isCamera = false

        this.color = [1, 1, 1, 1]

        this.enabled = true

        this.script = {
            update: (gameObject, state) => { }
        }

        this.calculateModelMatrix()

        gameObjects[gameObjects.length] = this
    }

    set velocity(velocity) {
        if (this.body != null) {
            this.body.velocity = new CANNON.Vec3(velocity.x, velocity.z, velocity.y)
        } else {
            throw "No physics body."
        }
    }

    lookAt(at) {
        if (this.parent != null)
            throw "Cannot use lookAt on children"

        let pos = this.position
        pos.z *= -1

        at.z *= -1

        let model = mat4.create()
        mat4.targetTo(model, pos.a, at.a, [0, 1, 0])

        let rotation = quat.create()
        mat4.getRotation(rotation, model)

        this.localRotation = rotation
    }

    addBody(mass, ground) {
        if (this.body != null)
            throw "This object already has a body"
        if (this.parent != null)
            throw "Objects with parents cannot have a physics body."

        let rotation = new CANNON.Quaternion(this.localRotation[0], -this.localRotation[2], this.localRotation[1], this.localRotation[3])
        let body;
        if (ground == undefined) {
            body = new CANNON.Body({
                mass: mass,
                position: new CANNON.Vec3(this.localPosition.x, this.localPosition.z, this.localPosition.y),
                quaternion: rotation
            })
        }
        else {
            body = new CANNON.Body({
                mass: mass,
                position: new CANNON.Vec3(this.localPosition.x, this.localPosition.z, this.localPosition.y),
                quaternion: rotation,
                type: CANNON.Body.STATIC
            })
        }
        world.addBody(body)
        this.body = body
    }

    addShape(type, p1, p2) {
        let topParent = this
        while (topParent.parent != null) {
            topParent = topParent.parent
        }
        if (topParent.body == null)
            throw "Cannot add shape to object without body and that has a top parent without body."
        this.shapeIndex = topParent.body.shapes.length
        let offset = Vector3.subtract(this.position, topParent.position)
        offset = vectorToBodyVector(offset)
        if (type == "sphere") {
            //console.log(this.localScale.x)
            let shape = new CANNON.Sphere(this.localScale.x / 2.0)
            this.shape = shape
            topParent.body.addShape(shape, offset)
        } else if (type == "box") {
            let shape = new CANNON.Box(new CANNON.Vec3(this.localScale.x / 2.0, this.localScale.z / 2.0, this.localScale.y / 2.0))
            this.shape = shape
            topParent.body.addShape(shape, offset)
        }
        else if (type == "heightfield") {
            var hfShape = new CANNON.Heightfield(p1, {
                elementSize: 1
            });
            this.shape = hfShape
            topParent.body.addShape(hfShape)
        }
        else if (type == "trimesh") {
            let shape = new CANNON.Trimesh(p1, p2)
            this.shape = shape
            topParent.body.addShape(shape)
        }
        else {
            throw "Unknown body type."
        }
    }

    setVelocity(velocity) {
        if (this.body == null)
            throw "Cannot set velocity of object without body."

        this.body.velocity = new CANNON.Vec3(velocity.x, velocity.z, velocity.y)
    }

    get body() {
        return this._body
    }

    set body(body) {
        if (body == null)
            throw "Cannot set body to null."
        this._body = body
    }

    get localPosition() {
        if (this.body != null) {
            let localPosition = new Vector3(this.body.position.x, this.body.position.z, this.body.position.y)
            localPosition.gameObject = this
            return localPosition
        }
        else
            return this._localPosition
    }
    set localPosition(localPosition) {
        if (this.body != null) {
            this.body.position.x = localPosition.x
            this.body.position.y = localPosition.z
            this.body.position.z = localPosition.y
        }
        else {
            this._localPosition = localPosition
            this._localPosition.gameObject = this
            this.calculateModelMatrix()
        }
    }

    get localRotation() {
        if (this.body != null)
            return bodyQuatToQuat(this.body.quaternion)
        else
            return this._localRotation
    }
    set localRotation(localRotation) {
        if (this.body != null) {
            let bodyRotation = quatToBodyQuat(localRotation)
            this.body.quaternion = bodyRotation
        } else {
            this._localRotation = localRotation
            this.calculateModelMatrix()
        }
    }

    get rotation() {
        let rotation = quat.create()
        mat4.getRotation(rotation, this.model)
        return rotation
    }
    set rotation(rotation) {
        throw "rotation cannot be set. Try setting localRotation"
    }

    // get localEulerAngles() {
    //     let rotationMatrix = mat4.create()
    //     mat4.fromQuat(rotationMatrix, this.localRotation)
    //     return eulerAnglesFromMatrix(rotationMatrix)
    // }
    // set localEulerAngles(localEulerAngles) {
    //     if (this.body != null)
    //         throw "eulerAngles cannot be set."
    // }

    get localScale() {
        return this._localScale
    }
    set localScale(localScale) {
        if (this.body != null)
            throw "Cannot change scale of GameObject with physics body."
        this._localScale = localScale
        this._localScale.gameObject = this
        this.calculateModelMatrix()
    }

    get position() {
        return new Vector3(this.model[12], this.model[13], -this.model[14])
    }
    set position(position) {
        throw "position cannot be set. Try setting localPosition."
    }

    // get eulerAngles() {
    //     return eulerAnglesFromMatrix(this.model)
    // }
    // set eulerAngles(eulerAngles) {
    //     throw "eulerAngles cannot be set."
    // }

    rotateX(degrees) {
        let rotation = this.localRotation
        quat.rotateX(rotation, rotation, degrees * Math.PI / 180.0)
        this.localRotation = rotation
    }
    rotateY(degrees) {
        let rotation = this.localRotation
        quat.rotateY(rotation, rotation, degrees * Math.PI / 180.0)
        this.localRotation = rotation
    }
    rotateZ(degrees) {
        let rotation = this.localRotation
        quat.rotateZ(rotation, rotation, degrees * Math.PI / 180.0)
        this.localRotation = rotation
    }

    get forward() {
        let direction = vec4.create()
        direction[0] = 0
        direction[1] = 0
        direction[2] = -1
        direction[3] = 1
        mat4.multiply(direction, this.model, direction)
        let position = this.position
        direction = new Vector3(direction[0] - position.x, direction[1] - position.y, -direction[2] - position.z)
        direction.normalize()
        return direction
    }
    get right() {
        let direction = vec4.create()
        direction[0] = 1
        direction[1] = 0
        direction[2] = 0
        direction[3] = 1
        mat4.multiply(direction, this.model, direction)
        let position = this.position
        direction = new Vector3(direction[0] - position.x, direction[1] - position.y, -direction[2] - position.z)
        direction.normalize()
        return direction
    }
    get up() {
        let direction = vec4.create()
        direction[0] = 0
        direction[1] = 1
        direction[2] = 0
        direction[3] = 1
        mat4.multiply(direction, this.model, direction)
        let position = this.position
        direction = new Vector3(direction[0] - position.x, direction[1] - position.y, -direction[2] - position.z)
        direction.normalize()
        return direction
    }

    get parent() {
        return this._parent
    }

    set parent(parent) {
        if (this.body != null)
            throw "Objects with parents cannot have a physics body."

        if (this._parent == null)
            gameObjects.splice(gameObjects.indexOf(this), 1)
        else
            this.parent.children.splice(this.parent.children.indexOf(this), 1)

        if (parent == null)
            gameObjects[gameObjects.length] = this
        else
            parent.children[parent.children.length] = this

        this._parent = parent

        this.calculateModelMatrix()
    }

    initDraw(gl, ext, mesh, material) {
        if (this.draw == null) {
            const vao = ext.createVertexArrayOES()
            ext.bindVertexArrayOES(vao)
            this.draw = {
                vao: vao,
                mesh: mesh,
                material: material
            }
        }
        else {
            this.draw.mesh = mesh
            this.draw.material = material
        }

        material.init(this.draw)
        ext.bindVertexArrayOES(null)
    }

    calculateModelMatrix() {
        const model = mat4.create();
        let localPosition = this.localPosition.a.slice()
        localPosition[2] = -localPosition[2]
        mat4.translate(model, model, localPosition);

        let rotationMatrix = mat4.create()
        mat4.fromQuat(rotationMatrix, this.localRotation)
        mat4.multiply(model, model, rotationMatrix)

        mat4.scale(model, model, this._localScale.a)
        if (this.parent != null)
            mat4.multiply(model, this.parent.model, model)
        this.model = model

        if (this.shapeIndex != null && this.shapeIndex != 0) {
            let topParent = this
            while (topParent.parent != null) {
                topParent = topParent.parent
            }

            let localMatrix = mat4.create()
            let p = mat4.create()
            mat4.invert(p, topParent.model)
            mat4.multiply(localMatrix, p, this.model)
            let offset = new Vector3(localMatrix[12], localMatrix[13], -localMatrix[14])
            topParent.body.shapeOffsets[this.shapeIndex] = vectorToBodyVector(offset)

            let rotation = quat.create()
            let pRotation = quat.create()
            quat.invert(pRotation, topParent.rotation)
            quat.multiply(rotation, pRotation, this.rotation)
            topParent.body.shapeOrientations[this.shapeIndex] = quatToBodyQuat(rotation)
        }

        this.children.forEach((child) => {
            child.calculateModelMatrix()
        })

        if (this.isCamera) {
            if (this.children.length > 0)
                throw "Camera should not have any children"
            this.calculateCameraView()
        }
    }

    drawSelf(gl, ext) {
        if (!this.enabled)
            return
        if (this.draw == null)
            return;

        ext.bindVertexArrayOES(this.draw.vao)

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, this.model);
        mat4.transpose(normalMatrix, normalMatrix);

        //const mvp = mat4.create();
        //mat4.multiply(mvp, Camera.main.viewProjection, this.model);

        gl.useProgram(this.draw.material.program);

        this.draw.material.setUniforms(this.draw, {
            model: this.model,
            view: Camera.main.view,
            projection: Camera.main.projection,
            normalMatrix: normalMatrix,
            color: this.color,
            fogColor: fogColor,
            time: state.time
        })

        gl.drawElements(gl.TRIANGLES, this.draw.mesh.indices.length, gl.UNSIGNED_SHORT, 0);

        ext.bindVertexArrayOES(null)
    }

    initCameraView() {
        const fieldOfView = 60.0 * Math.PI / 180.0;
        //now global because passing in gl would not be easy
        //const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.01;
        const zFar = 1000.0;
        const projection = mat4.create();
        mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);
        this.projection = projection
    }

    calculateCameraView() {
        const view = mat4.create();
        const forward = Camera.main.forward
        forward.z = -forward.z
        const position = new Vector3(Camera.main.position)
        position.z = -position.z
        const at = [
            position.x + forward.x,
            position.y + forward.y,
            position.z + forward.z
        ]
        mat4.lookAt(view, position.a, at, [0, 1, 0]);
        this.view = view;

        const viewProjection = mat4.create()
        mat4.multiply(viewProjection, this.projection, view);

        this.viewProjection = viewProjection
    }

    toString() {
        return this.name
    }

    printChildren(depth) {
        if (depth === undefined)
            depth = 0
        let str = ""
        for (let i = 0; i < depth; i++)
            str += " "
        str += this.name
        console.log(str)
        this.children.forEach(child => {
            child.printChildren(depth + 1)
        })
    }
}

function Destroy(gameObject) {
    if (gameObject.body != null)
        world.remove(gameObject.body)
    gameObjects.splice(gameObjects.indexOf(gameObject), 1)
    gameObject = null
}

function printSceneGraph() {
    gameObjects.forEach((gameObject) => {
        gameObject.printChildren()
    })
}

function initShaderProgram(gl, vsSource, fsSource) {
    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}