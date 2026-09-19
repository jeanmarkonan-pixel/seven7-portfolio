/**
 * Shaders — Singularité gravitationnelle (trou noir) + éclats d'énergie.
 */

/* ── Trou noir : disque d'accrétion + lentille gravitationnelle ── */

export const blackHoleVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const blackHoleFragmentShader = /* glsl */ `
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
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.1 + 3.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float angle = atan(p.y, p.x);

  // Rotation différentielle : le centre tourne plus vite (disque d'accrétion)
  float swirl = angle + uTime * (0.25 + 0.9 * exp(-r * 2.6));
  float disk = fbm(vec2(cos(swirl), sin(swirl)) * 2.4 + r * 5.0 - uTime * 0.35);

  // Anneau d'accrétion incandescent
  float ring = smoothstep(0.42, 0.30, r) * smoothstep(0.16, 0.26, r);
  vec3 ringColor = mix(vec3(1.0, 0.45, 0.1), vec3(0.65, 0.85, 1.0), disk);
  vec3 color = ringColor * ring * (0.8 + disk * 1.4);

  // Halo externe décroissant
  color += vec3(0.35, 0.2, 0.6) * exp(-r * 2.6) * 0.5;

  // Horizon des événements : noir absolu + photon sphere
  float hole = smoothstep(0.185, 0.145, r);
  color *= 1.0 - hole;
  float photonRing = smoothstep(0.205, 0.185, r) * smoothstep(0.165, 0.185, r);
  color += vec3(0.85, 0.95, 1.0) * photonRing * 1.8;

  float alpha = clamp((ring * 1.2 + exp(-r * 2.4) * 0.5 + photonRing), 0.0, 1.0) * uIntensity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * uIntensity, alpha);
}
`

/* ── Spark Burst : éclat de particules au clic (physique : vélocité + friction + gravité) ── */

export const sparkVertexShader = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute vec3 aVelocity;
attribute vec3 aOrigin;
attribute float aBirth;
attribute float aSize;

varying float vLife;

void main() {
  float age = uTime - aBirth;
  float life = clamp(age / 0.9, 0.0, 1.0);   // durée de vie 0.9s
  vLife = life;

  // Physique : position = origine + v*t (avec friction), gravité vers le bas
  float friction = 1.0 - exp(-age * 3.2);
  vec3 pos = aOrigin + aVelocity * friction * 0.55;
  pos.y -= 2.2 * age * age;                   // gravité

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float scale = step(0.0, age) * (1.0 - life);
  gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z) * max(scale, 0.0);
}
`

export const sparkFragmentShader = /* glsl */ `
varying float vLife;

void main() {
  if (vLife >= 1.0) discard;
  float d = distance(gl_PointCoord, vec2(0.5));
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  disc = pow(disc, 2.0);
  vec3 color = mix(vec3(1.0, 0.95, 0.75), vec3(0.4, 0.8, 1.0), vLife);
  float alpha = disc * (1.0 - vLife) * (1.0 - vLife);
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * 2.0, alpha);
}
`
