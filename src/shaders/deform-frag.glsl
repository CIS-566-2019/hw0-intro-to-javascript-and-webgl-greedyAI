#version 300 es
precision highp float;

uniform float u_Time;

in vec3 fs_Pos;
in vec3 fs_Nor;

out vec4 out_Col;

void main()
{
    // Color interpolation time value with cyclic
    // properties
    float t = ((u_Time - 1000.0 * floor(u_Time / 1000.0)) / 1000.0f) + fs_Nor.x;

    float PI = 3.14159265358979323846;

    // Use the standard rainbow palette, similar to
    // an iridescent shader
    float r = 0.5 + 0.5 * cos(2.0 * PI * (t));
    float g = 0.5 + 0.5 * cos(2.0 * PI * (t + 0.33));
    float b = 0.5 + 0.5 * cos(2.0 * PI * (t + 0.67));
    out_Col = vec4(r, g, b, 1.0);
}
