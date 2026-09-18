/**
 * Shaders — anneau de compétences en apesanteur.
 * Chaque instance est déplacée dans le VERTEX shader (GPU) :
 * orbite lente + flottement sinusoïdal + poussée de vent liée à la souris.
 * Aucune simulation physique CPU → 60 FPS constants.
 */

export const orbitVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSpeed;

  attribute vec3 aCenter;      // centre orbital de l'instance
  attribute float aPhase;      // phase aléatoire
  attribute float aOrbitSpeed;
  attribute float aTilt;

  varying vec2 vUv;
  varying float vWind;

  mat3 rotateY(float a) {
    float c = cos(a), s = sin(a);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  mat3 rotateZ(float a) {
    float c = cos(a), s = sin(a);
    return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
  }

  void main() {
    vUv = uv;

    // ── Orbite : rotation du centre autour de Y avec inclinaison ──
    float angle = uTime * aOrbitSpeed + aPhase;
    vec3 center = rotateY(angle) * rotateZ(aTilt) * aCenter;

    // ── Flottement (bulle en apesanteur) ──
    center.y += sin(uTime * 0.9 + aPhase * 3.1) * 0.22;
    center.x += sin(uTime * 0.55 + aPhase * 5.3) * 0.10;
    center.z += cos(uTime * 0.7 + aPhase * 2.2) * 0.10;

    // ── Rafale de vent : poussée radiale depuis le centre de l'écran ──
    // Les badges proches de l'axe de visée sont écartés par la rafale
    vec4 mvC = modelViewMatrix * vec4(center, 1.0);
    vec4 clipC = projectionMatrix * mvC;
    vec2 ndc = clipC.xy / clipC.w;
    float dist = distance(ndc, uMouse);
    float influence = smoothstep(0.55 + uSpeed * 0.5, 0.0, dist);
    vec2 dir = normalize(ndc - uMouse + vec2(0.0001));
    float gust = influence * uSpeed;
    center.xy += dir * gust * 1.4;
    vWind = gust;

    // Billboard léger : la carte fait face à la caméra avec une ondulation
    vec3 billboard = vec3(position.xy, position.z + sin(uTime * 1.4 + aPhase) * 0.03);
    vec4 mvPosition = mvC + vec4(billboard, 0.0);
    mvPosition.w = 1.0;

    gl_Position = projectionMatrix * mvPosition;
  }
`

export const orbitFragmentShader = /* glsl */ `
  uniform vec3 uColor;

  varying vec2 vUv;
  varying float vWind;

  void main() {
    // Pastille de verre dépoli : bord lumineux, centre translucide
    float d = distance(vUv, vec2(0.5));
    float edge = smoothstep(0.5, 0.46, d);
    float rim = smoothstep(0.5, 0.42, d) - smoothstep(0.44, 0.30, d);

    vec3 glass = mix(vec3(0.06), uColor, 0.35 + vWind * 0.6);
    vec3 color = glass + rim * (uColor * 1.6) + vWind * vec3(0.4, 0.85, 1.0) * 0.5;

    float alpha = edge * (0.16 + rim * 0.5 + vWind * 0.35);
    gl_FragColor = vec4(color, alpha);
  }
`
