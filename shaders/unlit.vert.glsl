#version 300 es

in vec3 a_position;
in vec3 a_center;
in float a_angle; 


uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec2 v_texcoord;

void main() {

    // Apply rotation to the offsets
    float cosA = cos(a_angle);
    float sinA = sin(a_angle);
    mat2 rotationMatrix = mat2(
        cosA, -sinA,
        sinA, cosA
    );

    // Apply rotation to the position offset
    vec2 rotatedOffset = rotationMatrix * a_position.xy;

    // Combine the center position with the rotated offset
    vec3 finalPosition = a_center + vec3(rotatedOffset, a_position.z);

    // Apply slight randomness to create the organic look of flower petals
    finalPosition.x += 0.005 * sin(a_angle * 3.0);
    finalPosition.y += 0.005 * cos(a_angle * 2.0);


    // Convert to clip space
    gl_Position = u_p * u_v * vec4(finalPosition, 1.0);
    
    v_texcoord = a_position.xy * 0.5 + 0.5;

}