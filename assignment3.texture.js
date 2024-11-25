'use strict'

/**
 * The Texture class is used to store texture information and load image data
 * 
 */
class Texture {

    /**
     * Create a new texture instance
     * 
     * @param {String} filename Path to the image texture to load
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Boolean} flip_y Determines if the texture should be flipped by WebGL (see Ch 7)
     */
    constructor(filename, gl, flip_y = true) {
        this.filename = filename 
        this.texture = null
        this.texture = this.createTexture( gl, flip_y )
    }

    /**
     * Get the GL handle to the texture
     * 
     * @returns {WebGLTexture} WebGL texture instance
     */
    getGlTexture() {
        return this.texture
    }

    /**
     * Loads image data from disk and creates a WebGL texture instance
     * 
     * @param {WebGL2RenderingContext} gl The webgl2 rendering context
     * @param {Boolean} flip_y Determines if the texture should be flipped by WebGL (see Ch 7)
     * @returns {WebGLTexture} WebGL texture instance
     */
    createTexture( gl, flip_y ) {

        // TODO: Set up texture flipping (see book Ch7)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip_y);

        // TODO: Create a new GL texture
        let texture = gl.createTexture();
    
        // TODO: Set up texture config values
        // TODO: We use level 0 which is the highest detail for mipmapping
        // TODO: Interally, we want to store the texture as RGBA (vec4)
        // TODO: The (source) format is also RGBA and the (source) type is unsigned byte
        // HINT: Refer to https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D to find the corresponding values
        const level = 0                  // TODO: set value
        const internal_format = gl.RGBA        // TODO: set value
        const src_format = gl.RGBA             // TODO: set value
        const src_type = gl.UNSIGNED_BYTE               // TODO: set value
    
        // Create a new image to load image data from disk
        const image = new Image();
        image.onload = () => {
            // TODO: Bind the texture and upload image data to the texture using the texture config values set above
            // NOTE: `image` can be used directly as a pointer to image data (see book Ch 7)
            // NOTE: image width and height are not needed (see code in book Ch 7)
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internal_format, src_format, src_type, image);

            // TODO: Generate mipmap from the full-size texture
            gl.generateMipmap(gl.TEXTURE_2D);

            // TODO: Set up texture wrapping mode to repeat the texture
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            
            // TODO: Set up texture MIN/MAG filtering
            // TODO: Use mipmapping and linear filtering      
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  
        }
        
        // By setting the image's src parameter the image will start loading data from disk
        // When the data is available, image.onload will be called
        image.src = this.filename
    
        return texture
    }
}

export default Texture