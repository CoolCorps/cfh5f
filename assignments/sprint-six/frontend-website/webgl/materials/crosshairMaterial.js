function newCrosshairMaterial(gl, ext, texture, flip) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTexcoord;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    uniform float flip;

    varying vec2 vTexcoord;

    void main(void) {
        gl_Position = projection * view * model * aVertexPosition;
        vTexcoord = vec2(aTexcoord.x, flip * aTexcoord.y);
    }
  `;
    const fsSource = `
    precision mediump float;
    varying vec2 vTexcoord;
    uniform float alpha;
    uniform sampler2D uTexture;
    void main(void) {
        vec4 albedo = texture2D(uTexture, vTexcoord);
        albedo.a *= alpha;
        gl_FragColor = albedo;
    }
  `;
    const defaultMaterialProgram = initShaderProgram(gl, vsSource, fsSource)
    const defaultMaterial = {
        program: defaultMaterialProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(defaultMaterialProgram, 'aVertexPosition'),
            texcoord: gl.getAttribLocation(defaultMaterialProgram, 'aTexcoord')
        },
        uniformLocations: {
            model: gl.getUniformLocation(defaultMaterialProgram, 'model'),
            view: gl.getUniformLocation(defaultMaterialProgram, 'view'),
            projection: gl.getUniformLocation(defaultMaterialProgram, 'projection'),
            flip: gl.getUniformLocation(defaultMaterialProgram, 'flip'),
            alpha: gl.getUniformLocation(defaultMaterialProgram, 'alpha'),
        },
        init: (draw) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.vertices), gl.STATIC_DRAW);
            gl.vertexAttribPointer(draw.material.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(draw.material.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(draw.mesh.indices), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.textures), gl.STATIC_DRAW)
            gl.vertexAttribPointer(draw.material.attribLocations.texcoord, 2, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(draw.material.attribLocations.texcoord)

            if (texture == undefined)
                texture = whiteTexture
            gl.bindTexture(gl.TEXTURE_2D, texture);
        },
        setUniforms: (draw, uniforms) => {
            gl.uniformMatrix4fv(draw.material.uniformLocations.model, false, uniforms.model);
            gl.uniformMatrix4fv(draw.material.uniformLocations.view, false, uniforms.view);
            gl.uniformMatrix4fv(draw.material.uniformLocations.projection, false, uniforms.projection);

            if (flip == null || flip)
                gl.uniform1f(draw.material.uniformLocations.flip, -1.0)
            else
                gl.uniform1f(draw.material.uniformLocations.flip, 1.0)
            
            gl.uniform1f(draw.material.uniformLocations.alpha, uniforms.color[3])

            gl.bindTexture(gl.TEXTURE_2D, texture);
        }
    };
    return defaultMaterial
}