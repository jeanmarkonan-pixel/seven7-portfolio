/**
 * Shaders — Loupe optique (réfraction sphérique).
 * Échantillonne la texture de la scène et applique une déformation
 * bulge/pinch + aberration chromatique radiale sur les bords de la lentille.
 */

export const lensVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const lensFragmentShader = /* glsl */ `
  uniform sampler2D uScene;     // texture de la scène sous la loupe
  uniform vec2 uLensCenter;     // position lentille (UV écran 0..1)
  uniform float uLensRadius;    // rayon en UV
  uniform float uZoom;          // grossissement
  uniform float uAspect;        // ratio écran (corrige la déformation)
  uniform float uActive;        // 0 = inactif, 1 = lentille active

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 toLens = uv - uLensCenter;
    toLens.x *= uAspect;                 // espace circulaire corrigé
    float dist = length(toLens) / uLensRadius;

    if (dist < 1.0 && uActive > 0.5) {
      // ── Réfraction sphérique (bulge) ──
      // f(d) = d * sqrt(1 - d²) donne un bombement optique crédible
      float sphere = sqrt(max(1.0 - dist * dist, 0.0));
      float refractAmount = (1.0 - sphere) * (1.0 / uZoom);
      vec2 dir = normalize(toLens + vec2(0.00001));
      vec2 refracted = uLensCenter + dir * dist * refractAmount * uLensRadius;
      refracted.x /= uAspect;

      // ── Aberration chromatique radiale (forte sur les bords) ──
      float edge = smoothstep(0.35, 1.0, dist);
      float ca = edge * 0.014;
      vec2 caDir = dir * ca * uLensRadius;
      vec2 caOffset = vec2(caDir.x / uAspect, caDir.y);

      float r = texture2D(uScene, refracted + caOffset).r;
      float g = texture2D(uScene, refracted).g;
      float b = texture2D(uScene, refracted - caOffset).b;
      vec3 color = vec3(r, g, b);

      // Grossissement perçu + lisibilité
      color *= 1.12;

      // ── Bord de lentille : anneau + reflet spéculaire ──
      float rim = smoothstep(0.86, 0.98, dist) * (1.0 - smoothstep(0.98, 1.0, dist));
      color += rim * vec3(0.55, 0.85, 1.0) * 0.6;

      // Reflet spéculaire en haut à gauche (source lumineuse)
      vec2 specPos = vec2(-0.42, 0.40);
      float spec = 1.0 - smoothstep(0.0, 0.30, distance(toLens / uLensRadius, specPos));
      color += spec * sphere * vec3(0.28);

      // Ombre interne basse (épaisseur du verre)
      float innerShade = smoothstep(0.55, 1.0, dist);
      color *= 1.0 - innerShade * 0.18;

      gl_FragColor = vec4(color, 1.0);
    } else {
      gl_FragColor = texture2D(uScene, uv);
    }
  }
`
