#version 300 es

// an attribute will receive data from a buffer
in vec3 a_position;
in vec3 a_normal;
in vec3 a_tangent;
in vec2 a_texture_coord;

// transformation matrices
uniform mat4x4 u_m;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

// output to fragment stage
// TODO: Create varyings to pass data to the fragment stage (position, texture coords, and more)
out vec3 v_fragPosition;    // ok
out vec3 v_normal;          // ok
out vec2 v_textCoord;       // no
out mat3 v_tbn;             // maybe error

void main() {

    // transform a vertex from object space directly to screen space
    // the full chain of transformations is:
    // object space -{model}-> world space -{view}-> view space -{projection}-> clip space
    
    vec4 vertex_position_world = u_m * vec4(a_position, 1.0);

    // NOTE: Different from the book, try to do all calculations in world space using the TBN to transform normals
    // HINT: Refer to https://learnopengl.com/Advanced-Lighting/Normal-Mapping for all above
    
    // TODO: Use the Gram-Schmidt process to re-orthogonalize tangents
    vec3 N = normalize(vec3(u_m * vec4(a_normal, 0.0)));
    vec3 T = normalize(vec3(u_m * vec4(a_tangent, 0.0)));
    T = normalize(T - dot(T, N) * N);                       // Gram-Schmidt orthogonalization
    vec3 B = cross(N, T);                                   // Ensure Bitangent is perpendicular to N and T

    // TODO: Construct TBN matrix from normals, tangents and bitangents
    mat3 tbn = mat3(T, B, N);

    //Forward data to fragment stage 
    v_fragPosition = vec3(u_m * vec4(a_position, 1.0));
    v_normal = N;
    v_textCoord = a_texture_coord;
    v_tbn = tbn;

    // JUST PASS, NOT DOING ANYTHING XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    // v_fragPosition = vec3(u_m * vec4(a_position, 1.0));
    // v_normal = a_normal;
    // v_textCoord = a_texture_coord;
    // v_tbn = tbn;


    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);
    
    

}