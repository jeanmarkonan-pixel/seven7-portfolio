/**
 * Shaders — Flammes hyper-réalistes & braises.
 * Simplex Noise 3D + FBM (Fractal Brownian Motion, 5 octaves).
 * Palette incandescente : charbon #050200 → magma #e62b00 → ardent #ff7a00 → plasma #fff5ea.
 */

const SIMPLEX = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p = p * 2.04 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}
`

export const fireVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fireFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;   // visibilité de la zone feu (0..1, pilotée par le scroll)
uniform vec2 uMouse;

varying vec2 vUv;

${SIMPLEX}

vec3 firePalette(float t) {
  vec3 charcoal = vec3(0.020, 0.008, 0.0);   // #050200
  vec3 magma    = vec3(0.902, 0.169, 0.0);   // #e62b00
  vec3 blaze    = vec3(1.0, 0.478, 0.0);     // #ff7a00
  vec3 plasma   = vec3(1.0, 0.961, 0.918);   // #fff5ea
  vec3 c = mix(charcoal, magma, smoothstep(0.0, 0.42, t));
  c = mix(c, blaze, smoothstep(0.42, 0.72, t));
  c = mix(c, plasma, smoothstep(0.72, 0.97, t));
  return c;
}

void main() {
  vec2 uv = vUv;

  // Vent de la souris : le feu se couche vers le curseur
  float wind = uMouse.x * 0.35;
  uv.x += wind * uv.y * uv.y;

  // Corps de flamme : FBM advecté vers le haut, 2 couches de vitesses
  float t = uTime * 1.15;
  float n1 = fbm(vec3(uv.x * 3.4, uv.y * 2.6 - t, t * 0.32));
  float n2 = fbm(vec3(uv.x * 7.0 + 13.7, uv.y * 5.2 - t * 1.9, t * 0.5));

  // Profil vertical : base large, sommet effilé + coupe bas/haut
  float shape = (1.0 - uv.y) * 1.35 - pow(abs(uv.x - 0.5) * 2.1, 1.7);
  float flame = shape + n1 * 0.85 + n2 * 0.35 - 0.28;
  flame = clamp(flame, 0.0, 1.0);

  // Atténue les bords latéraux et le bas (attache au sol)
  flame *= smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.55, uv.y);
  flame *= smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x);

  vec3 color = firePalette(flame);

  // Lueur au sol
  float glow = exp(-uv.y * 5.0) * 0.35;
  color += vec3(1.0, 0.35, 0.05) * glow;

  float alpha = clamp(flame * 1.6 + glow, 0.0, 1.0) * uIntensity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * uIntensity, alpha);
}
`

/* ── Braises : particules instanciées GPU, ascension + turbulence + dissipation ── */

export const emberVertexShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uPixelRatio;

attribute vec3 aSeed;     // x: phase, y: vitesse, z: taille

varying float vLife;
varying float vFlicker;

void main() {
  float life = fract(uTime * aSeed.y * 0.14 + aSeed.x);   // 0 → 1, boucle
  vLife = life;

  // Ascension avec accélération
  vec3 pos = position;
  pos.y += life * life * 7.5;
  // Turbulence horizontale qui grandit avec l'altitude
  float wob = life * life * 1.4;
  pos.x += sin(uTime * 1.8 + aSeed.x * 40.0) * wob;
  pos.z += cos(uTime * 1.4 + aSeed.x * 31.0) * wob * 0.6;

  // Scintillement
  vFlicker = 0.6 + 0.4 * sin(uTime * (6.0 + aSeed.y * 8.0) + aSeed.x * 90.0);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSeed.z * uPixelRatio * (26.0 / -mv.z) * (1.0 - life * 0.7) * vFlicker;
}
`

export const emberFragmentShader = /* glsl */ `
uniform float uIntensity;

varying float vLife;
varying float vFlicker;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float disc = 1.0 - smoothstep(0.0, 0.5, d);
  disc = pow(disc, 2.2);

  // Dissipation d'opacité : naissance rapide, extinction lente
  float fade = smoothstep(0.0, 0.08, vLife) * (1.0 - smoothstep(0.55, 1.0, vLife));

  // Couleur : plasma au cœur → magma en fin de vie
  vec3 color = mix(vec3(1.0, 0.85, 0.55), vec3(0.9, 0.17, 0.0), vLife);

  float alpha = disc * fade * vFlicker * uIntensity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color * 1.6, alpha);
}
`
