export default `
uniform vec2 uResolution;
uniform float uSize;
uniform sampler2D uParticlesTexture;
attribute vec2 aParticlesUv;
attribute vec3 aColor;
attribute float aSize;
varying vec3 vColor;

void main()
{
    vec4 particle = texture(uParticlesTexture, aParticlesUv);

    // Final position
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    // gl_PointSize = uSize * uResolution.y;
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (0.5 / - viewPosition.z); 
    // gl_PointSize = size * (1.0 / - viewPosition.z);  // sizeAttenuation

    // Varyings
    // vColor = vec3(1.0);     // All white
    vColor = aColor;     // Baked colors
}
`