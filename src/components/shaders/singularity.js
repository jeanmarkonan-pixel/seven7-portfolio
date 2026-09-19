/**
 * Shaders — Singularité prismatique (footer) + éclats de cristal au clic.
 * Direction : Liquid Glass & Kinetic Prism. Zéro flamme.
 */

/* ── Prisme gravitationnel : anneaux concentriques irisés + vortex de verre ── */

export const prismVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const prismFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

// Iridescence prismatique : palette arc-en-ciel froide
vec3 iris(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float angle = atan(p.y, p.x);

  // Vortex de verre : rotation différentielle
  float swirl = angle + uTime * (0.18 + 0.7 * exp(-r * 2.2));
  float bands = sin(r * 26.0 - uTime * 1.4 + swirl * 2.0) * 0.5 + 0.5;
  float facets = noise(vec2(swirl * 3.0, r * 9.0 - uTime * 0.4));

  // Anneaux prismatiques irisés
  float ring = smoothstep(0.85, 0.25, r) * smoothstep(0.08, 0.22, r);
  vec3 color = iris(facets * 0.8 + r * 1.6 - uTime * 0.08) * ring * (0.35 + bands * 0.65);

  // Cœur : lentille de verre sombre avec liseré lumineux
  float core = smoothstep(0.16, 0.10, r);
  color *= 1.0 - core * 0.85;
  float coreRim = smoothstep(0.17, 0.14, r) * smoothstep(0.11, 0.14, r);
  color += iris(uTime * 0.15) * coreRim * 2.2;

  // Halo froid externe
  color += vec3(0.35, 0.55, 0.85) * exp(-r * 3.0) * 0.35;

  float alpha = clamp((ring * 0.9 + exp(-r * 2.6) * 0.4 + coreRim), 0.0, 1.0) * uIntensity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * uIntensity, alpha);
}
`

/* ── Crystal Burst : éclats prismatiques au clic (vélocité + friction + gravité) ── */

export const sparkVertexShader = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute vec3 aVelocity;
attribute vec3 aOrigin;
attribute float aBirth;
attribute float aSize;

varying float vLife;
varying float vHue;

void main() {
  float age = uTime - aBirth;
  float life = clamp(age / 0.9, 0.0, 1.0);
  vLife = life;
  vHue = fract(aSize * 3.7);

  float friction = 1.0 - exp(-age * 3.2);
  vec3 pos = aOrigin + aVelocity * friction * 0.55;
  pos.y -= 2.2 * age * age;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float scale = step(0.0, age) * (1.0 - life);
  gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z) * max(scale, 0.0);
}
`

export const sparkFragmentShader = /* glsl */ `
varying float vLife;
varying float vHue;

vec3 iris(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  if (vLife >= 1.0) discard;
  float d = distance(gl_PointCoord, vec2(0.5));
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  disc = pow(disc, 2.0);
  // Cristal blanc → teinte prismatique en fin de vie
  vec3 color = mix(vec3(1.0), iris(vHue + vLife * 0.6), vLife * 0.85);
  float alpha = disc * (1.0 - vLife) * (1.0 - vLife);
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * 1.9, alpha);
}
`
