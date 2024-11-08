import Particle from './particle.js';
import * as mat4 from '../lib/glmatrix/mat4.js'



export default class particleManager {
    constructor(particleCount, verticesPerParticle, gl, shader) {
        // initial variable
        this.particleCount = particleCount;
        this.shader = shader;
        this.verticesPerParticle = verticesPerParticle;
        this.angles = new Float32Array(particleCount * verticesPerParticle);
        
        //initial buffer
        this.positions = new Float32Array(particleCount *3);
        this.velocities = new Float32Array(particleCount *3);
        this.createBuffer(gl);

        this.createVAO(gl);

        for (let i = 0; i < this.particleCount; i++) {
            this.initializeParticle(i);

        }


    }

    
    // Inisitalize all particle, including reset
    initializeParticle(i) {
        
        // initialze location
        let cx = (Math.random() - 0.5) * 2+1;
        let cy = Math.random() * 2 + 1;
        let cz = (Math.random() - 0.5) * 2+1;

        // central point
        for (let j = 0; j < this.verticesPerParticle; j++) {
            let baseIndex = (i * this.verticesPerParticle + j) * 3;
            this.centerPositions[baseIndex] = cx;
            this.centerPositions[baseIndex + 1] = cy;
            this.centerPositions[baseIndex + 2] = cz;
        }

        // speed limit
        let minSpeed = 0.05;
        let maxSpeed = 0.15;

        this.velocities[i * 3] = (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() > 0.5 ? 1 : -1);
        this.velocities[i * 3 + 1] = -(Math.random() * (maxSpeed - minSpeed) + minSpeed);
        this.velocities[i * 3 + 2] = (Math.random() * (maxSpeed - minSpeed) + minSpeed) * (Math.random() > 0.5 ? 1 : -1);

        // 旋转角度
        for (let j = 0; j < this.verticesPerParticle; j++) {
            this.angles[i * this.verticesPerParticle + j] = Math.random() * Math.PI * 2;
        }
        
    }

    // create VBO
    createBuffer(gl) {
        // central buffer
        const vertexCount = this.particleCount * this.verticesPerParticle;
        this.centerPositions = new Float32Array(vertexCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            // random central
            let cx = (Math.random() - 0.5) * 2;
            let cy = Math.random() * 2;
            let cz = (Math.random() - 0.5) * 2;

            // all veretex
            for (let j = 0; j < this.verticesPerParticle; j++) {
                let baseIndex = (i * this.verticesPerParticle + j) * 3;
                this.centerPositions[baseIndex] = cx;
                this.centerPositions[baseIndex + 1] = cy;
                this.centerPositions[baseIndex + 2] = cz;
            }
        }
        
        // center buffer
        this.centerBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.centerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.centerPositions, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // potiosn buffer
        this.positionBuffer = gl.createBuffer();
        this.positions = new Float32Array(vertexCount * 3);

        // all point for each vertex
        for (let i = 0; i < this.particleCount; i++) {
        const baseIndex = i * this.verticesPerParticle * 3;

        for (let j = 0; j < this.verticesPerParticle; j++) {
            // Coordinate
            const angle = (j / this.verticesPerParticle) * Math.PI * 2;
            
            // Shape
            const radius = 0.025 * (1 + 0.6 * Math.sin(2.5 * angle)) * (1 + 0.1 * Math.sin(6 * angle));

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const z = 0.0;

            this.positions[baseIndex + j * 3] = x;
            this.positions[baseIndex + j * 3 + 1] = y;
            this.positions[baseIndex + j * 3 + 2] = z;

            // Angle
            this.angles[i * this.verticesPerParticle + j] = Math.random() * Math.PI * 2;
        }

    }



        // position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
        // unbind shitttt
        gl.bindBuffer(gl.ARRAY_BUFFER, null);


        // angle buffer
        this.angleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.angleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.angles, gl.DYNAMIC_DRAW);
        // unbind shitttt
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        console.log("Positions:", this.positions);
        console.log("Angles:", this.angles);        

    }

    // since not complete object, so not sending it to object3d, only redo here
    // create VAO
    createVAO(gl) {
        // set up vao
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // bind center
        gl.bindBuffer(gl.ARRAY_BUFFER, this.centerBuffer);
        const centerLocation = this.shader.getAttributeLocation('a_center');
        gl.enableVertexAttribArray(centerLocation);
        gl.vertexAttribPointer(centerLocation, 3, gl.FLOAT, false, 0, 0);

        // bind position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positionLocation = this.shader.getAttributeLocation('a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        
        // bind for angle
        this.angleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.angleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.angles, gl.DYNAMIC_DRAW);

        const angleLocation = this.shader.getAttributeLocation('a_angle');
        gl.enableVertexAttribArray(angleLocation);
        gl.vertexAttribPointer(angleLocation, 1, gl.FLOAT, false, 0, 0);

        // unbind shit
        gl.bindVertexArray(null);

    };


    // set texture, receive from webgl app
    setTexture(texture) {
        this.texture = texture;
    }

    update(delta_time, gl) {
        for (let i = 0; i < this.particleCount; i++) {
            let baseIndex = i * this.verticesPerParticle * 3; // 每个粒子6个顶点，每个顶点3个分量

            // update location
            this.centerPositions[baseIndex] += this.velocities[i * 3] * delta_time;
            this.centerPositions[baseIndex + 1] += this.velocities[i * 3 + 1] * delta_time;
            this.centerPositions[baseIndex + 2] += this.velocities[i * 3 + 2] * delta_time;
    
            // 更新所有6个顶点的中心点
            for (let j = 1; j < this.verticesPerParticle; j++) {
                this.centerPositions[baseIndex + j * 3] = this.centerPositions[baseIndex];
                this.centerPositions[baseIndex + j * 3 + 1] = this.centerPositions[baseIndex + 1];
                this.centerPositions[baseIndex + j * 3 + 2] = this.centerPositions[baseIndex + 2];
            }
            
            // 如果粒子超出边界，重新初始化
            let boundary = 3.0;
            if (Math.abs(this.centerPositions[baseIndex]) > boundary ||
                Math.abs(this.centerPositions[baseIndex + 1]) > boundary ||
                Math.abs(this.centerPositions[baseIndex + 2]) > boundary) {
                this.initializeParticle(i);
            }

            // 如果粒子向上飘得太高，反转其 Y 方向速度
            if (this.velocities[i * 3 + 1] > 0) {
                this.velocities[i * 3 + 1] = -Math.abs(this.velocities[i * 3 + 1]);
            }
            // 旋转
            this.angles[i * this.verticesPerParticle] += delta_time * 0.5;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.centerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.centerPositions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render(gl, viewMatrix, projectionMatrix) {
        
        // use shader
        this.shader.use();

        // pass parameter
        this.shader.setUniform4x4f('u_v', viewMatrix);
        this.shader.setUniform4x4f('u_p', projectionMatrix);

        // bind texture
        if(this.texture){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture.getGlTexture());

            // send texture to shader
            this.shader.setUniform1i('u_sampler',0);
        }

        // bind VAO
        gl.bindVertexArray(this.vao);
        //gl.drawArrays(gl.POINTS, 0, this.particleCount);
        gl.drawArrays(gl.TRIANGLES, 0, this.particleCount * this.verticesPerParticle);

        // unbind shit
        gl.bindVertexArray(null);
    }
}


