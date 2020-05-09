function newDefaultMaterial(gl, ext, texture) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTexcoord;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    uniform mat4 uNormalMatrix;

    varying vec3 v_normal;
    //varying float shading;
    varying vec2 vTexcoord;

    varying vec3 fogPosition;

    void main(void) {
        gl_Position = projection * view * model * aVertexPosition;
        v_normal = mat3(uNormalMatrix) * aVertexNormal;
        vec3 normal = normalize(v_normal);
        //shading = dot(normal, (vec3(0.5, 0.7, 1)));
        vTexcoord = vec2(aTexcoord.x, -aTexcoord.y);

        fogPosition = (view * model * aVertexPosition).xyz;
    }
  `;
    const fsSource = `
    precision mediump float;
    varying vec3 v_normal;
    //varying float shading;
    uniform vec4 uColor;
    varying vec2 vTexcoord;
    uniform sampler2D uTexture;
    varying vec3 fogPosition;
    uniform vec4 fogColor;
    void main(void) {
        vec3 normal = normalize(v_normal);
 
        float light = dot(normal, (vec3(0.5, 0.7, 1)));
        //light = shading;
        float ambient = 0.2;

        light = clamp(light, 0.0, 1.0);
        light += ambient;
        light = clamp(light, 0.0, 1.0);

        vec4 albedo = texture2D(uTexture, vTexcoord) * uColor;

        float fogAmmount = smoothstep(100.0, 200.0, length(fogPosition));
        vec4 color = vec4(albedo.rgb * light, albedo.a);
        gl_FragColor = mix(color, fogColor, fogAmmount);
    }
  `;
    const defaultMaterialProgram = initShaderProgram(gl, vsSource, fsSource)
    const defaultMaterial = {
        program: defaultMaterialProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(defaultMaterialProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(defaultMaterialProgram, 'aVertexNormal'),
            texcoord: gl.getAttribLocation(defaultMaterialProgram, 'aTexcoord')
        },
        uniformLocations: {
            model: gl.getUniformLocation(defaultMaterialProgram, 'model'),
            view: gl.getUniformLocation(defaultMaterialProgram, 'view'),
            projection: gl.getUniformLocation(defaultMaterialProgram, 'projection'),
            normalMatrix: gl.getUniformLocation(defaultMaterialProgram, 'uNormalMatrix'),
            color: gl.getUniformLocation(defaultMaterialProgram, 'uColor'),
            fogColor: gl.getUniformLocation(defaultMaterialProgram, 'fogColor'),
        },
        init: (draw) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.vertices), gl.STATIC_DRAW);
            gl.vertexAttribPointer(draw.material.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(draw.material.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(draw.mesh.indices), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.vertexNormals), gl.STATIC_DRAW);
            gl.vertexAttribPointer(draw.material.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(draw.material.attribLocations.vertexNormal);

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.textures), gl.STATIC_DRAW)
            gl.vertexAttribPointer(draw.material.attribLocations.texcoord, 2, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(draw.material.attribLocations.texcoord)
            
            if(texture == undefined)
                texture = whiteTexture
            gl.bindTexture(gl.TEXTURE_2D, texture);
        },
        setUniforms: (draw, uniforms) => {
            gl.uniformMatrix4fv(draw.material.uniformLocations.model, false, uniforms.model);
            gl.uniformMatrix4fv(draw.material.uniformLocations.view, false, uniforms.view);
            gl.uniformMatrix4fv(draw.material.uniformLocations.projection, false, uniforms.projection);

            gl.uniformMatrix4fv(draw.material.uniformLocations.normalMatrix, false, uniforms.normalMatrix);
            gl.uniform4fv(draw.material.uniformLocations.color, uniforms.color);
            gl.uniform4fv(draw.material.uniformLocations.fogColor, uniforms.fogColor);
            gl.bindTexture(gl.TEXTURE_2D, texture);
        }
    };
    return defaultMaterial
}