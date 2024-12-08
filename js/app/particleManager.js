import Particle from './particle.js';

export default class particleManager {
    constructor(particleNum, gl, shader) {
        this.particleCount = particleNum;
        this.VNum = 8;
        this.shader = shader;

        this.particleList = [];
        for (let i = 0; i < this.particleCount; i++) {
            let particle = new Particle();
            this.particleList.push(particle);
        }

        this.createBuffer(gl);
        this.createVAO(gl);
    }

    createBuffer(gl) {
        // Gather all positions from particles
        this.positions = new Float32Array(this.particleList.length * 3 * this.VNum);
        this.updateBufferData();

        // Create position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    updateBufferData() {
        for (let i = 0; i < this.particleList.length; i++) {
            let p = this.particleList[i];
            let baseIndex = i * 3 * this.VNum;

            for (let j = 0; j < this.VNum; j++) {

                let x = p.vertices[j * 3] * p.scale;
                let y = p.vertices[j * 3 + 1] * p.scale;
                let z = p.vertices[j * 3 + 2] * p.scale;
                
                // circle rotate and flip
                let rotatedX_Y = x * Math.cos(p.rotationY) - z * Math.sin(p.rotationY);
                let rotatedZ_Y = x * Math.sin(p.rotationY) + z * Math.cos(p.rotationY);

                let rotatedX_Z = rotatedX_Y * Math.cos(p.rotationZ) - y * Math.sin(p.rotationZ);
                let rotatedY_Z = rotatedX_Y * Math.sin(p.rotationZ) + y * Math.cos(p.rotationZ);

                this.positions[baseIndex + j * 3] = p.position.x + rotatedX_Z;
                this.positions[baseIndex + j * 3 + 1] = p.position.y + rotatedY_Z;
                this.positions[baseIndex + j * 3 + 2] = p.position.z + rotatedZ_Y;
            }
        }
    }

    createVAO(gl) {
        // VAO setup
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positionLocation = this.shader.getAttributeLocation('a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    update(deltaTime, gl) {
        for (let particle of this.particleList) {
            particle.update(deltaTime);
            if (particle.life > particle.lifeTime) {
                particle.reset();
            }
        }

        // Update positions
        this.updateBufferData();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render(gl, viewMatrix, projectionMatrix) {
        this.shader.use();
        this.shader.setUniform4x4f('u_v', viewMatrix);
        this.shader.setUniform4x4f('u_p', projectionMatrix);

        gl.bindVertexArray(this.vao);
        
        // draw all vectex seperate
        for (let i = 0; i < this.particleCount; i++) {
            
            gl.drawArrays(gl.TRIANGLE_FAN, i * this.VNum, this.VNum);
        }

        gl.bindVertexArray(null);
    }
}
