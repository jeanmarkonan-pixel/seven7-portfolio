import { useEffect, useRef, useState } from 'react'
import { useSeason } from '../../hooks/useSeason'

/**
 * SeasonOverlay — pluie de particules plein écran selon la saison, avec
 * profondeur de champ (3 plans flou/taille/vitesse), vent global qui
 * souffle par rafales cohérentes, feuilles/pétales qui "tournent" en
 * tombant (flip), lueur ambiante colorée par saison, et une légère
 * répulsion des particules autour du curseur pour rendre l'effet
 * palpable. Canvas 2D léger — respecte prefers-reduced-motion et se
 * met en pause hors onglet.
 */

const CONFIGS = {
  winter: {
    count: 90,
    colors: ['#ffffff', '#e8f6ff', '#cfeaff'],
    size: [1, 4.2],
    speedY: [14, 40],
    swayAmp: [6, 22],
    swaySpeed: [0.3, 0.9],
    windStrength: 16,
    direction: 1,
    shape: 'glow',
    ambient: 'radial-gradient(1200px circle at 12% -12%, rgba(147,197,253,0.16), transparent 60%)',
  },
  spring: {
    count: 52,
    colors: ['#ffd7e6', '#ffe8f0', '#fff1c9', '#ffffff'],
    size: [4, 9],
    speedY: [14, 30],
    swayAmp: [22, 44],
    swaySpeed: [0.4, 1.0],
    windStrength: 12,
    direction: 1,
    shape: 'petal',
    ambient: 'radial-gradient(1100px circle at 88% -10%, rgba(255,214,235,0.14), transparent 60%)',
  },
  summer: {
    count: 50,
    colors: ['#ffe9a8', '#fff3cf', '#ffd580'],
    size: [1.6, 4.4],
    speedY: [6, 15],
    swayAmp: [14, 30],
    swaySpeed: [0.25, 0.7],
    windStrength: 5,
    direction: -1,
    shape: 'glow',
    ambient: 'radial-gradient(1300px circle at 92% -6%, rgba(255,205,110,0.2), transparent 55%)',
  },
  autumn: {
    count: 58,
    colors: ['#e07a3f', '#c4602c', '#f2a65a', '#8a4a2a', '#d9862f'],
    size: [6, 12],
    speedY: [20, 42],
    swayAmp: [30, 56],
    swaySpeed: [0.3, 0.8],
    windStrength: 22,
    direction: 1,
    shape: 'leaf',
    ambient: 'radial-gradient(1200px circle at 8% -6%, rgba(217,119,6,0.15), transparent 60%)',
  },
}

const REPEL_RADIUS = 130
const REPEL_STRENGTH = 46

function rand(min, max) {
  return min + Math.random() * (max - min)
}
function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Vent global : superposition de sinusoïdes lentes -> rafales organiques, jamais répétitives. */
function windAt(t) {
  return Math.sin(t * 0.00017) * 1 + Math.sin(t * 0.00046 + 2.1) * 0.6 + Math.sin(t * 0.00091 + 4.4) * 0.3
}

function makeParticle(cfg, w, h, seedY) {
  // depth^1.6 biaise vers plus de petites particules lointaines, moins de grandes proches (parallaxe crédible)
  const depth = Math.pow(Math.random(), 1.6)
  return {
    x: rand(0, w),
    y: seedY ? rand(0, h) : cfg.direction === 1 ? -30 : h + 30,
    depth,
    size: lerp(cfg.size[0], cfg.size[1], depth),
    speedY: lerp(cfg.speedY[0] * 0.5, cfg.speedY[1], depth) * cfg.direction,
    swayAmp: rand(cfg.swayAmp[0], cfg.swayAmp[1]),
    swaySpeed: rand(cfg.swaySpeed[0], cfg.swaySpeed[1]),
    swayPhase: rand(0, Math.PI * 2),
    windFactor: 0.3 + depth * 1.0,
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-1, 1) * 0.8,
    flipPhase: rand(0, Math.PI * 2),
    flipSpeed: rand(0.6, 1.6),
    color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
    opacity: lerp(0.25, 0.95, depth) * rand(0.85, 1),
    twinklePhase: rand(0, Math.PI * 2),
    vx: 0,
    vy: 0,
  }
}

function drawParticle(ctx, p, cfg) {
  const blur = (1 - p.depth) * 2.6
  ctx.save()
  ctx.translate(p.x, p.y)
  if (cfg.shape === 'leaf' || cfg.shape === 'petal') {
    ctx.rotate(p.rotation)
    ctx.scale(Math.cos(p.flipPhase), 1) // "tourne" en tombant, effet de retournement 3D pauvre-mais-crédible
  }
  ctx.globalAlpha = p.opacity
  if (blur > 0.15) ctx.filter = `blur(${blur.toFixed(2)}px)`

  if (cfg.shape === 'glow') {
    const twinkle = 0.75 + Math.sin(p.twinklePhase) * 0.25
    const r = p.size * 2.2
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    grad.addColorStop(0, p.color)
    grad.addColorStop(0.4, p.color + 'aa')
    grad.addColorStop(1, p.color + '00')
    ctx.globalAlpha = p.opacity * twinkle
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
  } else if (cfg.shape === 'petal') {
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.ellipse(0, 0, p.size, p.size * 0.58, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (cfg.shape === 'leaf') {
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.moveTo(0, -p.size)
    ctx.quadraticCurveTo(p.size * 0.85, -p.size * 0.2, 0, p.size)
    ctx.quadraticCurveTo(-p.size * 0.85, -p.size * 0.2, 0, -p.size)
    ctx.fill()
    ctx.filter = 'none'
    ctx.globalAlpha = p.opacity * 0.5
    ctx.strokeStyle = '#00000055'
    ctx.lineWidth = Math.max(0.4, p.size * 0.05)
    ctx.beginPath()
    ctx.moveTo(0, -p.size * 0.9)
    ctx.lineTo(0, p.size * 0.9)
    ctx.stroke()
  }
  ctx.restore()
}

export default function SeasonOverlay({ enabled }) {
  const canvasRef = useRef(null)
  const { season } = useSeason()
  const stateRef = useRef({ particles: [], w: 0, h: 0, cfg: null })
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (reduced || !enabled) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId
    let running = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      stateRef.current.w = w
      stateRef.current.h = h
    }

    const seedParticles = () => {
      const cfg = CONFIGS[season] || CONFIGS.winter
      const { w, h } = stateRef.current
      stateRef.current.cfg = cfg
      stateRef.current.particles = Array.from({ length: cfg.count }, () => makeParticle(cfg, w, h, true))
    }

    resize()
    seedParticles()

    const onPointerMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const onPointerLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    let last = performance.now()
    const loop = (now) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const { particles, w, h, cfg } = stateRef.current
      ctx.clearRect(0, 0, w, h)

      const wind = windAt(now) * cfg.windStrength
      const mouse = mouseRef.current

      // tri par profondeur : les plus lointaines d'abord, pour un vrai effet de parallaxe
      particles.sort((a, b) => a.depth - b.depth)

      for (const p of particles) {
        p.y += p.speedY * dt
        const sway = Math.sin(now * 0.001 * p.swaySpeed + p.swayPhase) * p.swayAmp * 0.02
        p.x += (sway + wind * p.windFactor) * dt
        p.rotation += p.rotSpeed * dt
        p.flipPhase += p.flipSpeed * dt
        p.twinklePhase += dt * 2

        // répulsion douce autour du curseur : rend l'effet "palpable"
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
          p.vx += (dx / (dist || 1)) * force * dt
          p.vy += (dy / (dist || 1)) * force * dt
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 0.9
        p.vy *= 0.9

        const offscreenBottom = cfg.direction === 1 && p.y > h + 30
        const offscreenTop = cfg.direction === -1 && p.y < -30
        const offscreenX = p.x < -60 || p.x > w + 60
        if (offscreenBottom || offscreenTop || offscreenX) {
          Object.assign(p, makeParticle(cfg, w, h, false))
        }
        drawParticle(ctx, p, cfg)
      }
      ctx.filter = 'none'

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onVisibility = () => {
      running = !document.hidden
      if (running) {
        last = performance.now()
        rafId = requestAnimationFrame(loop)
      } else {
        cancelAnimationFrame(rafId)
      }
    }
    const onResize = () => resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [season, enabled, reduced])

  if (reduced) return null

  const ambient = (CONFIGS[season] || CONFIGS.winter).ambient

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[84] transition-[background] duration-1000"
        style={{ background: ambient, mixBlendMode: 'screen' }}
      />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85]" />
    </>
  )
}
