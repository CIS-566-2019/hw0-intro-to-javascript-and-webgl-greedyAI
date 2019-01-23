#version 300 es

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform float u_Time;

in vec4 vs_Pos;
in vec4 vs_Nor;

out vec3 fs_Pos;
out vec3 fs_Nor;

void main()
{
    fs_Nor = normalize(mat3(u_ModelInvTr) * vec3(vs_Nor));

    float PI = 3.14159265358979323846;

    // Interpolation time value using modified cosine function to ensure vertices are being
    // perturbed at all times.
    float interpolatedTime = smoothstep(0.0, 1.0, clamp(0.5 + cos(2.0 * PI * u_Time * 0.0002) / 2.0, 0.0, 1.0));

    // Perturb the model into a "ball" of radius 4 while flipping y-coordinates of vertex positions.
    vec4 ballPosition = mix(vs_Pos, vec4(4.0 * normalize(vec3(vs_Pos)).x,
                                         -4.0 * normalize(vec3(vs_Pos)).y,
                                         4.0 * normalize(vec3(vs_Pos)).z,
                                         1.0), interpolatedTime);

    // Further perturb the model using a trig function.                                     
    vec4 interpolatedPosition = vec4(sin(PI * ballPosition.x),
                                     sin(PI * ballPosition.y),
                                     sin(PI * ballPosition.z),
                                     1.0);

    // Set the position that the geometry's vertices are to be rendered
    vec4 modelposition = u_Model * interpolatedPosition;
    fs_Pos = vec3(modelposition);
    gl_Position = u_ViewProj * modelposition;
}
