'use strict'

import Texture from './texture.js'


class Material {

    constructor( kA = [0,0,0], kD = [0,0,0], kS = [0,0,0], shininess = 1.0, map_kD = null, map_nS = null, map_norm ) {
        this.kA = kA
        this.kD = kD
        this.kS = kS
        this.shininess = shininess

        this.map_kD = map_kD
        this.map_nS = map_nS
        this.map_norm = map_norm
    }

    hasTexture() {
        return this.map_kD != null || this.map_nS != null || this.map_norm != null
    }

    hasMapKD() {
        return this.map_kD != null
    }

    hasMapNS() {
        return this.map_nS != null
    }

    hasMapNorm() {
        return this.map_norm != null
    }

    getMapKD() {
        return this.map_kD.getGlTexture()
    }

    getMapNS() {
        return this.map_nS.getGlTexture()
    }

    getMapNorm() {
        return this.map_norm.getGlTexture()
    }
}

export default Material
