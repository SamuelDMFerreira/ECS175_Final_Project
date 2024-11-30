#version 300 es

#define MAX_LIGHTS 16

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

uniform bool u_show_normals;

// struct definitions
struct AmbientLight {
    vec3 color;
    float intensity;
};

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    float intensity;
};

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
};

struct Material {
    vec3 kA;
    vec3 kD;
    vec3 kS;
    float shininess;
    sampler2D map_kD;
    sampler2D map_nS;
    sampler2D map_norm;
};

// lights and materials
uniform AmbientLight u_lights_ambient[MAX_LIGHTS];
uniform DirectionalLight u_lights_directional[MAX_LIGHTS];
uniform PointLight u_lights_point[MAX_LIGHTS];

uniform Material u_material;

// camera position in world space
uniform vec3 u_eye;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;

// received from vertex stage
// TODO: Create variables to receive from the vertex stage
in vec3 fragPosition;   // World-space position
in vec2 fragTexCoords;  // Texture coordinates
in mat3 TBN;            // TBN matrix for normal mapping

// Compute world-space normal from the normal map
vec3 calculateNormal() {
    vec3 normal_map = texture(u_material.map_norm, fragTexCoords).rgb;
    normal_map = normal_map * 2.0 - 1.0; // Map from [0,1] to [-1,1]
    return normalize(TBN * normal_map);
}

// Ambient light shading
vec3 shadeAmbientLight(Material material, AmbientLight light) {
    vec3 texColor = texture(material.map_kD, fragTexCoords).rgb;
    return light.color * light.intensity * (material.kA * texColor);
}

// Directional light shading
vec3 shadeDirectionalLight(Material material, DirectionalLight light, vec3 normal, vec3 eye_dir) {
    vec3 texColor = texture(material.map_kD, fragTexCoords).rgb;

    // Calculating the L vector. N is already passed so we don't need to calculate it.
    vec3 lightDirection = normalize(-light.direction);
    
    float diff = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = light.color * light.intensity * (material.kD * texColor) * diff;
    
    // Calculating the R vector. We don't need to claculate V since I did that with eye_dir in main
    vec3 reflectDirection = reflect(-lightDirection, normal);
    float spec = pow(max(dot(reflectDirection, eye_dir), 0.0), material.shininess * texture(material.map_nS, fragTexCoords).r);
    vec3 specular = light.color * light.intensity * (material.kS * spec);
    
    return diffuse + specular;
}

// Point light shading
vec3 shadePointLight(Material material, PointLight light, vec3 normal, vec3 eye_dir, vec3 frag_pos) {
    vec3 texColor = texture(material.map_kD, fragTexCoords).rgb;
    
    // Calculating the L vector. N is already passed so we don't need to calculate it.
    vec3 lightDirection = normalize(light.position - frag_pos);

    float distance = length(light.position - frag_pos);
    float attenuation = 1.0 / (distance * distance);
    

    float diff = max(dot(normal, lightDirection), 0.0);
    vec3 diffuse = light.color * light.intensity * (material.kD * texColor) * diff;
    
    // Calculating the R vector. We don't need to claculate V since I did that with eye_dir in main
    vec3 reflectDirection = reflect(-lightDirection, normal);
    float spec = pow(max(dot(reflectDirection, eye_dir), 0.0), material.shininess * texture(material.map_nS, fragTexCoords).r);
    vec3 specular = light.color * light.intensity * (material.kS * spec);
    
    return attenuation * (diffuse + specular);
}

void main() {
    // Calculate world-space normal
    vec3 normal = calculateNormal();

    // if we only want to visualize the normals, no further computations are needed
    // !do not change this code!
    if (u_show_normals == true) {
        o_fragColor = vec4(normal, 1.0);
        return;
    }

    // View direction
    vec3 eye_dir = normalize(u_eye - fragPosition);

    // Initialize light contribution (Originally light_contribution, but I copy pasted my old code)
    vec3  totalColor = vec3(0.0);

    // Add directional light contribution
    for (int i = 0; i < MAX_LIGHTS; i++) {
         totalColor += shadeAmbientLight(u_material, u_lights_ambient[i]);
         totalColor += shadeDirectionalLight(u_material, u_lights_directional[i], normal, eye_dir);
         totalColor += shadePointLight(u_material, u_lights_point[i], normal, eye_dir, fragPosition);
    }

    // Output final color
    o_fragColor = vec4( totalColor, 1.0);
}