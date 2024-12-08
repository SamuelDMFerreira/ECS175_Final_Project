#version 300 es

precision mediump float;

in vec3 a_position;
in vec3 a_center;
in float a_angle; 


uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec2 v_texcoord;

void main() {
    // Calculate rotation using the angle
    float cosAngle = cos(a_angle);
    float sinAngle = sin(a_angle);

    // Rotation matrix around Z-axis
    mat2 rotation = mat2(
        cosAngle, -sinAngle,
        sinAngle, cosAngle
    );

    // Apply rotation to the particle's position
    vec2 rotatedPosition = rotation * a_position.xy;

    // Update the final position
    vec3 finalPosition = a_center + vec3(rotatedPosition, a_position.z);

    // Convert to clip space
    gl_Position = u_p * u_v * vec4(finalPosition, 1.0);
    
    v_texcoord = a_position.xy;

}