/**
 * Liquid Distortion Shader — déformation organique au survol.
 * Génère sa propre texture de déplacement procédurale (fbm) : aucun asset requis.
 * uIntensity pilote la transition (0 = net, 1 = distorsion maximale).
 */

export const liquidVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const liquidFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uIntensity;
  uniform float uTime;
  uniform vec2 uMouse;      // position souris dans la carte (0..1)

  varying vec2 vUv;

  // Bruit de valeur + fbm pour un displacement procédural
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // Influence radiale centrée sur la souris dans la carte
    float hoverMask = smoothstep(0.9, 0.15, distance(uv, uMouse));

    // Champ de déplacement liquide animé
    float n1 = fbm(uv * 3.2 + uTime * 0.22);
    float n2 = fbm(uv * 3.2 - uTime * 0.18 + 42.0);
    vec2 displacement = vec2(n1 - 0.5, n2 - 0.5) * 2.0;

    float strength = uIntensity * (0.35 + hoverMask * 0.65);
    vec2 distortedUv = uv + displacement * strength * 0.12;

    // Zoom doux au survol
    distortedUv = mix(uv, (distortedUv - 0.5) * 0.94 + 0.5, uIntensity);

    // Aberration chromatique renforcée par la distorsion
    float ca = strength * 0.012;
    float r = texture2D(uTexture, distortedUv + vec2(ca, 0.0)).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - vec2(ca, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Voile holographique subtil qui suit la souris
    color += vec3(0.10, 0.22, 0.28) * hoverMask * uIntensity * n1;

    gl_FragColor = vec4(color, 1.0);
  }
`

/**
 * Génère des visuels de projet procéduraux sur canvas (aucun asset externe).
 * Chaque projet a sa palette et son motif signature.
 */
export function generateProjectTexture(variant, width = 1024, height = 640) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const palettes = {
    comptable: { bg1: '#04140b', bg2: '#0d3320', accent: '#34d399', accent2: '#fbbf24', label: "P'TIT COMPTABLE", sub: 'Comptabilité SYSCOHADA' },
    audit: { bg1: '#0a0a1a', bg2: '#1e1e4a', accent: '#818cf8', accent2: '#67e8f9', label: 'SEVEN7 AUDIT', sub: 'Audit externe automatisé' },
    hydra: { bg1: '#12041a', bg2: '#3b0d4a', accent: '#c084fc', accent2: '#67e8f9', label: 'HYDRA', sub: 'SaaS de gestion PME' },
    metamorphose: { bg1: '#140a04', bg2: '#3d2410', accent: '#fb923c', accent2: '#f5d78e', label: 'MÉTAMORPHOSE', sub: 'Boutique 3D immersive' },
    formation: { bg1: '#040d14', bg2: '#0c2a3d', accent: '#38bdf8', accent2: '#a5f3fc', label: 'FORMATION IA', sub: 'Comptabilité · Audit · Finance' },
    backend: { bg1: '#0d0d0d', bg2: '#262626', accent: '#a3a3a3', accent2: '#67e8f9', label: 'BACKEND', sub: 'API REST · Firebase' },
    cola: { bg1: '#1a0505', bg2: '#4a0e0e', accent: '#ff2d2d', accent2: '#ffb3a7', label: 'COCA-COLA', sub: 'Liquid Experience' },
    nike: { bg1: '#050510', bg2: '#101038', accent: '#7df9ff', accent2: '#b76bff', label: 'NIKE', sub: 'Cyber Velocity' },
    aether: { bg1: '#04080c', bg2: '#0c2233', accent: '#67e8f9', accent2: '#ffffff', label: 'AETHER', sub: 'Spatial OS' },
    lumina: { bg1: '#0a0806', bg2: '#2a2016', accent: '#f5d78e', accent2: '#fff7e0', label: 'LUMINA', sub: 'High Jewelry' },
  }
  const p = palettes[variant] || palettes.aether

  // Fond dégradé
  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, p.bg1)
  grad.addColorStop(1, p.bg2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Orbes lumineux
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 80 + Math.random() * 240
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const col = i % 2 === 0 ? p.accent : p.accent2
    g.addColorStop(0, col + '55')
    g.addColorStop(1, col + '00')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)
  }

  // Lignes de flux signature
  ctx.strokeStyle = p.accent + '66'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 26; i++) {
    ctx.beginPath()
    const yBase = (i / 26) * height
    for (let x = 0; x <= width; x += 16) {
      const y = yBase + Math.sin(x * 0.008 + i * 0.7) * 34 + Math.cos(x * 0.003 + i) * 22
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Grille technique discrète
  ctx.strokeStyle = '#ffffff10'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y < height; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  // Typographie du visuel
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 ${Math.floor(width * 0.085)}px Archivo, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(p.label, width * 0.06, height * 0.82)
  ctx.fillStyle = p.accent
  ctx.font = `italic 500 ${Math.floor(width * 0.034)}px Georgia, serif`
  ctx.fillText(p.sub, width * 0.062, height * 0.9)

  // Monogramme
  ctx.fillStyle = '#ffffff22'
  ctx.font = `900 ${Math.floor(width * 0.3)}px Archivo, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText('7', width * 0.97, height * 0.52)
  ctx.textAlign = 'left'

  return canvas
}
