/**
 * Shader — Monolithe de verre du carrousel projets.
 * Fluid Mesh Warp : déformation liquide élastique pilotée par la vélocité
 * du scroll (uWarp). Réfraction douce + voile prismatique + split RGB.
 */

export const monolithVertexShader = /* glsl */ `
uniform float uTime;
uniform float uWarp;        // vélocité du scroll lissée (-1..1)
uniform float uHover;       // 0..1

varying vec2 vUv;
varying float vWarp;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Déformation liquide élastique : courbure horizontale + ondulation
  float bend = uWarp * (uv.x - 0.5) * 1.4;
  pos.z += bend * bend * 0.9;                                  // arc
  pos.y += sin(uv.x * 3.14159) * uWarp * 0.35;                 // gondolement
  pos.x += sin(uv.y * 6.28 + uTime * 2.2) * 0.02 * (abs(uWarp) + uHover * 0.5);

  vWarp = uWarp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const monolithFragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uWarp;
uniform float uHover;
uniform vec2 uMouse;        // souris locale (0..1)
uniform float uSelected;    // 0..1 portail ouvert

varying vec2 vUv;
varying float vWarp;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

vec3 iris(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 uv = vUv;

  // Warp chromatique lié à la vélocité du scroll
  float w = abs(vWarp);
  vec2 warpOff = vec2(vWarp * 0.02 * (uv.y - 0.5), vWarp * 0.012 * (uv.x - 0.5));
  uv += warpOff;

  // Loupe locale au survol (bulge x1.5 doux dans la texture)
  vec2 toM = uv - uMouse;
  float mDist = length(toM * vec2(1.6, 1.0));
  if (mDist < 0.42 && uHover > 0.01) {
    float s = sqrt(max(1.0 - (mDist / 0.42) * (mDist / 0.42), 0.0));
    uv = uMouse + (uv - uMouse) * mix(1.0, 1.0 / 1.5, (1.0 - s) * uHover);
  }

  // Lecture avec split RGB (amplifié par warp + hover)
  float ca = 0.0035 + w * 0.014 + uHover * 0.006;
  float r = texture2D(uTexture, uv + vec2(ca, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(ca, 0.0)).b;
  vec3 color = vec3(r, g, b);

  // Réfraction de verre : voile prismatique diagonal qui glisse
  float sheen = noise(vec2(uv.x * 2.2 - uTime * 0.14, uv.y * 3.0));
  color += iris(uv.x * 0.9 + uv.y * 0.4 + sheen * 0.5 + uTime * 0.05) * 0.075;

  // Reflet spéculaire qui suit la souris
  float spec = exp(-length(vUv - uMouse) * 4.5) * 0.20;
  color += vec3(0.9, 0.97, 1.0) * spec * (0.4 + uHover * 0.6);

  // Mode portail (clic) : onde liquide d'ouverture depuis le centre
  if (uSelected > 0.01) {
    float portal = smoothstep(uSelected * 1.2, uSelected * 1.2 - 0.25, distance(vUv, vec2(0.5)));
    color = mix(color, color * 1.6 + iris(uTime * 0.3) * 0.35, portal);
  }

  gl_FragColor = vec4(color, 1.0);
}
`
