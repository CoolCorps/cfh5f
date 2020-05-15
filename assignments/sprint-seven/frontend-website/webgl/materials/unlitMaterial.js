function newUnlitMaterial(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 mvp;
    void main(void) {
        gl_Position = mvp * aVertexPosition;
    }
  `;
    const fsSource = `
    precision mediump float;
    uniform vec4 uColor;
    void main(void) {
        gl_FragColor = uColor;
    }
  `;
    const unlitMaterialProgram = initShaderProgram(gl, vsSource, fsSource)
    const unlitMaterial = {
        program: unlitMaterialProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(unlitMaterialProgram, 'aVertexPosition')
        },
        uniformLocations: {
            mvp: gl.getUniformLocation(unlitMaterialProgram, 'mvp'),
            color: gl.getUniformLocation(unlitMaterialProgram, 'uColor')
        },
        init: (draw) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(draw.mesh.vertices), gl.STATIC_DRAW);
            gl.vertexAttribPointer(draw.material.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(draw.material.attribLocations.vertexPosition);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(draw.mesh.indices), gl.STATIC_DRAW);
        },
        setUniforms: (draw, uniforms) => {
            gl.uniformMatrix4fv(draw.material.uniformLocations.mvp, false, uniforms.mvp);
            gl.uniform4fv(draw.material.uniformLocations.color, uniforms.color);
        }
    };
    return unlitMaterial
}