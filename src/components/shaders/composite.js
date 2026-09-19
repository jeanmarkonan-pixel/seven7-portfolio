/**
 * Shader — Passe de composition fullscreen.
 * Combine 3 effets optiques sur la texture de la scène :
 *  1. LOUPE : dôme de réfraction liquide (bulge x1.4) + split RGB sur les bords
 *  2. SHOCKWAVE : onde de choc au clic (ripple + aberration chromatique, 0.8s)
 *  3. HEAT HAZE : distorsion thermique au-dessus de la zone de feu
 */

export const compositeVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const compositeFragmentShader = /* glsl */ `
uniform sampler2D uScene;
uniform float uTime;
uniform float uAspect;

// Loupe
uniform vec2 uLensCenter;    // UV écran (0..1)
uniform float uLensRadius;   // rayon UV
uniform float uZoom;         // grossissement (1.4)

// Onde de choc (2 impacts simultanés max, recyclés)
uniform vec4 uShockA;        // xy = centre UV, z = temps de départ, w = actif
uniform vec4 uShockB;

// Heat haze
uniform float uFireVisibility;   // 0..1, piloté par le scroll
uniform vec2 uFireAnchor;        // position UV approximative du feu

varying vec2 vUv;

vec3 sampleScene(vec2 uv) {
  return texture2D(uScene, clamp(uv, 0.001, 0.999)).rgb;
}

void main() {
  vec2 uv = vUv;
  vec3 color;
  float edgeGlow = 0.0;

  // ─── 3. HEAT HAZE : distorsion thermique montante au-dessus du feu ───
  if (uFireVisibility > 0.01) {
    vec2 toFire = uv - uFireAnchor;
    toFire.x *= uAspect;
    float fireDist = length(toFire);
    // Colonne d'air chaud au-dessus de la flamme
    float column = smoothstep(0.45, 0.0, abs(toFire.x)) * smoothstep(-0.05, 0.25, toFire.y) * smoothstep(0.75, 0.1, toFire.y);
    float haze = column * uFireVisibility;
    uv.x += sin(uv.y * 90.0 + uTime * 6.0) * 0.0035 * haze;
    uv.y += sin(uv.x * 70.0 - uTime * 5.0) * 0.0025 * haze;
  }

  // ─── 2. SHOCKWAVE : anneau de distorsion qui se propage ───
  for (int i = 0; i < 2; i++) {
    vec4 shock = i == 0 ? uShockA : uShockB;
    if (shock.w > 0.5) {
      float age = uTime - shock.z;
      float life = age / 0.8;                       // durée 0.8s
      if (life < 1.0) {
        vec2 toClick = uv - shock.xy;
        toClick.x *= uAspect;
        float dist = length(toClick);
        float radius = life * 0.55;                 // vitesse de propagation
        float ring = smoothstep(0.09, 0.0, abs(dist - radius));
        float decay = 1.0 - life;
        // Displacement ripple : pousse vers l'extérieur
        vec2 dir = normalize(toClick + vec2(0.00001));
        uv += dir * ring * decay * 0.028 * vec2(1.0 / uAspect, 1.0);
        edgeGlow += ring * decay;
      }
    }
  }

  // ─── 1. LOUPE : dôme de réfraction liquide ───
  vec2 toLens = uv - uLensCenter;
  toLens.x *= uAspect;
  float lensDist = length(toLens) / uLensRadius;

  if (lensDist < 1.0) {
    float sphere = sqrt(max(1.0 - lensDist * lensDist, 0.0));
    float refractAmount = (1.0 - sphere) * (1.0 / uZoom);
    vec2 dir = normalize(toLens + vec2(0.00001));
    vec2 refracted = uLensCenter + dir * lensDist * refractAmount * uLensRadius * vec2(1.0 / uAspect, 1.0);

    // Aberration chromatique forte sur les bords de la lentille
    float edge = smoothstep(0.30, 1.0, lensDist);
    vec2 caOff = dir * edge * 0.011 * uLensRadius * vec2(1.0 / uAspect, 1.0);

    color.r = sampleScene(refracted + caOff).r;
    color.g = sampleScene(refracted).g;
    color.b = sampleScene(refracted - caOff).b;
    color *= 1.12;

    // Anneau de lentille + reflet spéculaire
    float rim = smoothstep(0.86, 0.97, lensDist) * (1.0 - smoothstep(0.97, 1.0, lensDist));
    color += rim * vec3(0.55, 0.85, 1.0) * 0.55;
    vec2 specPos = vec2(-0.40, 0.38);
    float spec = 1.0 - smoothstep(0.0, 0.32, distance((toLens / uLensRadius), specPos));
    color += spec * sphere * vec3(0.25);
    color *= 1.0 - smoothstep(0.6, 1.0, lensDist) * 0.15;
  } else {
    color = sampleScene(uv);
  }

  // Shockwave : aberration chromatique additionnelle sur l'anneau
  if (edgeGlow > 0.003) {
    float caAmt = edgeGlow * 0.02;
    color.r += sampleScene(uv + vec2(caAmt, 0.0)).r * edgeGlow * 0.5;
    color.b += sampleScene(uv - vec2(caAmt, 0.0)).b * edgeGlow * 0.5;
    color += vec3(0.4, 0.75, 1.0) * edgeGlow * 0.18;
  }

  // Vignettage global
  float vig = 1.0 - smoothstep(0.45, 1.35, length((vUv - 0.5) * vec2(uAspect, 1.0)));
  color *= mix(0.72, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
`
