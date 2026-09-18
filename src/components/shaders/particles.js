/**
 * Shaders GLSL — champ de particules « effet vent ».
 * Tout le mouvement est calculé sur GPU (vertex shader) : 60 FPS garantis.
 */

export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;        // position souris NDC
  uniform vec2 uVelocity;     // vélocité souris
  uniform float uSpeed;       // magnitude lissée (rafale)
  uniform float uPixelRatio;

  attribute float aScale;
  attribute vec3 aRandom;

  varying float vAlpha;
  varying float vDistort;

  // Simplex noise 3D (Ashima / Ian McEwan — MIT)
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
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
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

  void main() {
    vec3 pos = position;

    // ── Nappe de bruit organique (respiration lente) ──
    float n = snoise(vec3(pos.x * 0.28 + uTime * 0.06, pos.y * 0.28, uTime * 0.045));
    pos.z += n * 0.55;
    pos.x += snoise(vec3(pos.y * 0.22, uTime * 0.05, aRandom.x * 4.0)) * 0.28;
    pos.y += snoise(vec3(pos.x * 0.22, uTime * 0.04, aRandom.y * 4.0)) * 0.28;

    // ── Rafale de vent liée à la souris ──
    // Projection approximative de la position monde vers l'espace écran
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;

    float dist = distance(ndc, uMouse);
    float radius = 0.55 + uSpeed * 0.6;
    float influence = smoothstep(radius, 0.0, dist);

    // Direction du vent = direction de la vélocité souris
    vec2 windDir = normalize(uVelocity + vec2(0.0001));
    float gust = influence * uSpeed;

    // Poussée directionnelle + turbulence tourbillonnaire autour du curseur
    vec2 swirl = vec2(-(ndc.y - uMouse.y), ndc.x - uMouse.x) * 2.2;
    vec2 push = windDir * 1.6 + swirl;
    pos.x += push.x * gust * (0.6 + aRandom.z * 0.8);
    pos.y += push.y * gust * (0.6 + aRandom.z * 0.8);
    pos.z += gust * (aRandom.x - 0.5) * 1.4;

    vDistort = gust;

    // ── Rendu point ──
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * uPixelRatio * (34.0 / -mvPosition.z);
    gl_PointSize *= 1.0 + gust * 1.6;

    // Fade aux bords + éclaircissement sous la rafale
    float edge = smoothstep(1.35, 0.4, length(ndc));
    vAlpha = edge * (0.32 + gust * 0.68);
  }
`

export const particleFragmentShader = /* glsl */ `
  uniform vec3 uColorA;   // titane
  uniform vec3 uColorB;   // holographique cyan

  varying float vAlpha;
  varying float vDistort;

  void main() {
    // Disque doux (soft round particle)
    float d = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - smoothstep(0.0, 0.5, d);
    strength = pow(strength, 1.8);

    vec3 color = mix(uColorA, uColorB, clamp(vDistort * 2.4, 0.0, 1.0));
    gl_FragColor = vec4(color, strength * vAlpha);
  }
`
