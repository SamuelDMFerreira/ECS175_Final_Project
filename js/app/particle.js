class Particle {
    
    // input position, velocity, size, life time
    constructor(x, y, z, vx, vy, vz, size, lifeTime) {
        this.position = { x, y, z };
        this.velocity = { x: vx, y: vy, z: vz };
        this.rotation = {x:0, y:0, z:0};
        this.size = size;
        this.lifeTime = lifeTime;
        this.life = 0;
    }

    update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        this.rotation.x += 0.01 * deltaTime;
        this.rotation.y += 0.02 * deltaTime;
        this.rotation.z += 0.01 * deltaTime;
        this.life += deltaTime;
    }


    reset() {

    }
}

export default Particle;
