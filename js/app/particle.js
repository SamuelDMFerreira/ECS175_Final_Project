class Particle {
    constructor() {
        
        this.position = this.getXYZ();
        this.velocity = this.getV();

        // Life setting ---------------------------------------------
        // adjust life time here!!!
        this.lifeTime =  Math.random() *10 +15;
        this.life = 0;

        // Rotation System ---------------------------------------------
        // Y and Z axis roration
        // adjust rotation speed here!!!
        this.rotationY = Math.random() * Math.PI * 2; 
        this.rotationZ = Math.random() * Math.PI * 2;
        this.rotationSpeedY = (Math.random() - 0.5) * 10;
        this.rotationSpeedZ = (Math.random() - 0.5) * 10;

        // Particle Shaoe ---------------------------------------------
        // size and shape from here
        this.scale = 0.006
        this.vertices = this.getVertex();
    }

    // Random spawn and velocity =====================================
    // adjust shape here!!!
    getVertex(){
        return [
            0.0, 0.05, 0.0,        // Tip of the petal (top)
            -0.03, 0.002, 0.0,      // Left curve near the top
            -0.05, -0.02, 0.0,     // Left curve middle
            -0.03, -0.07, 0.0,     // Left bottom
            0.0, -0.1, 0.0,        // Bottom point
            0.03, -0.07, 0.0,      // Right bottom
            0.05, -0.002, 0.0,      // Right curve middle
            0.03, 0.02, 0.0        // Right curve near the top
        ];

    }

    // adjust spawn location here!!!
    getXYZ(){
        return {
            x: (Math.random() - 0.5) * -0.8,
            y: (Math.random() * 0.75) * 0.8,
            z: (Math.random() - 0.5) * -0.8
        };
    }

    // adjust velocity here!!!
    getV() {
        return {
            x: (Math.random() - 0.2) * 0.04, 
            y: (Math.random() - 1) * 0.04, 
            z: (Math.random() - 0.3) * 0.04
        };
    }

    // All time update =====================================
    update(deltaTime) {

        // lay on ground
        if (this.position.y <= -0.0070) {
            this.velocity.xyz = 0;
            this.rotationZ = Math.PI / 2; 
            
            this.life += deltaTime; 
        }

        else{
            // falling
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;

            // rotating
            this.rotationY += this.rotationSpeedY * deltaTime;
            this.rotationZ += this.rotationSpeedZ * deltaTime; 

            // sway
            this.position.x += Math.sin(this.life * 0.2) * 0.0005;

            this.life += deltaTime;
        }

        
    }

    reset() {
        this.position = this.getXYZ();
        this.velocity = this.getV();

        this.rotationY = Math.random() * Math.PI * 2;
        this.rotationZ = Math.random() * Math.PI * 2;

        this.life = 0;
    }
}

export default Particle;

