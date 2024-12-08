#version 300 es
precision mediump float;

uniform sampler2D u_sampler;
in vec2 v_texcoord;

// Final color
out vec4 o_fragColor;

void main() {

    vec3 pinkColor = vec3(0.85, 0.65, 0.8);


    o_fragColor = vec4(pinkColor, 1.0);

}