/**
 * Shader — Passe de composition fullscreen.
 * Direction : Liquid Glass & Kinetic Prism.
 *  1. LOUPE : dôme de réfraction liquide (bulge x1.5) + split RGB sur les bords
 *  2. QUANTUM RIPPLE : onde prismatique au clic (mercure + arc-en-ciel, 0.9s)
 *  3. Vignettage abyssal
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
uniform vec2 uLensCenter;
uniform float uLensRadius;
uniform float uZoom;         // 1.5

// Ondes prismatiques (2 impacts simultanés max, recyclés)
uniform vec4 uShockA;        // xy = centre UV, z = temps de départ, w = actif
uniform vec4 uShockB;

varying vec2 vUv;

vec3 sampleScene(vec2 uv) {
  return texture2D(uScene, clamp(uv, 0.001, 0.999)).rgb;
}

vec3 iris(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 uv = vUv;
  vec3 color;
  float ringGlow = 0.0;
  float ringHue = 0.0;

  // ─── QUANTUM RIPPLE : goutte dans du mercure ───
  for (int i = 0; i < 2; i++) {
    vec4 shock = i == 0 ? uShockA : uShockB;
    if (shock.w > 0.5) {
      float age = uTime - shock.z;
      float life = age / 0.9;
      if (life < 1.0) {
        vec2 toClick = uv - shock.xy;
        toClick.x *= uAspect;
        float dist = length(toClick);
        float radius = life * 0.6;
        // Double anneau concentrique (onde principale + harmonique)
        float ring1 = smoothstep(0.075, 0.0, abs(dist - radius));
        float ring2 = smoothstep(0.045, 0.0, abs(dist - radius * 0.55));
        float decay = (1.0 - life) * (1.0 - life);
        vec2 dir = normalize(toClick + vec2(0.00001));
        uv += dir * (ring1 + ring2 * 0.6) * decay * 0.024 * vec2(1.0 / uAspect, 1.0);
        ringGlow += (ring1 + ring2 * 0.7) * decay;
        ringHue = dist * 2.2 - age * 1.4;
      }
    }
  }

  // ─── LOUPE : dôme de réfraction liquide ───
  vec2 toLens = uv - uLensCenter;
  toLens.x *= uAspect;
  float lensDist = length(toLens) / uLensRadius;

  if (lensDist < 1.0) {
    float sphere = sqrt(max(1.0 - lensDist * lensDist, 0.0));
    float refractAmount = (1.0 - sphere) * (1.0 / uZoom);
    vec2 dir = normalize(toLens + vec2(0.00001));
    vec2 refracted = uLensCenter + dir * lensDist * refractAmount * uLensRadius * vec2(1.0 / uAspect, 1.0);

    float edge = smoothstep(0.30, 1.0, lensDist);
    vec2 caOff = dir * edge * 0.012 * uLensRadius * vec2(1.0 / uAspect, 1.0);

    color.r = sampleScene(refracted + caOff).r;
    color.g = sampleScene(refracted).g;
    color.b = sampleScene(refracted - caOff).b;
    color *= 1.12;

    float rim = smoothstep(0.86, 0.97, lensDist) * (1.0 - smoothstep(0.97, 1.0, lensDist));
    color += rim * vec3(0.6, 0.85, 1.0) * 0.5;
    vec2 specPos = vec2(-0.40, 0.38);
    float spec = 1.0 - smoothstep(0.0, 0.32, distance((toLens / uLensRadius), specPos));
    color += spec * sphere * vec3(0.22);
    color *= 1.0 - smoothstep(0.6, 1.0, lensDist) * 0.12;
  } else {
    color = sampleScene(uv);
  }

  // Ripple : liseré prismatique arc-en-ciel + split RGB sur l'anneau
  if (ringGlow > 0.003) {
    float caAmt = ringGlow * 0.016;
    color.r += sampleScene(uv + vec2(caAmt, 0.0)).r * ringGlow * 0.4;
    color.b += sampleScene(uv - vec2(caAmt, 0.0)).b * ringGlow * 0.4;
    color += iris(ringHue) * ringGlow * 0.22;
  }

  // Vignettage abyssal
  float vig = 1.0 - smoothstep(0.45, 1.35, length((vUv - 0.5) * vec2(uAspect, 1.0)));
  color *= mix(0.70, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
`
