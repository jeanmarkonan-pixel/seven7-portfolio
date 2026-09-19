import { useEffect, useRef } from 'react'
import { useSeason } from '../../hooks/useSeason'

/**
 * SeasonOverlay — pluie de particules plein écran selon la saison
 * (neige/pétales/pollen doré/feuilles), en canvas 2D léger, superposée
 * au design existant sans toucher aux couleurs de fond. Respecte
 * prefers-reduced-motion (désactivée) et se met en pause hors onglet.
 */

const CONFIGS = {
  winter: {
    count: 70,
    colors: ['#ffffff', '#dff4ff', '#bfe8ff'],
    size: [1, 3.4],
    speedY: [18, 46],
    sway: [8, 26],
    swaySpeed: [0.4, 1.1],
    direction: 1,
    rotate: false,
    glow: 6,
    shape: 'circle',
  },
  spring: {
    count: 44,
    colors: ['#ffd7e6', '#ffe8f0', '#fff1c9', '#ffffff'],
    size: [4, 8],
    speedY: [16, 34],
    sway: [26, 50],
    swaySpeed: [0.5, 1.2],
    direction: 1,
    rotate: true,
    glow: 0,
    shape: 'petal',
  },
  summer: {
    count: 46,
    colors: ['#ffe9a8', '#fff3cf', '#ffd580'],
    size: [2.2, 4.6],
    speedY: [8, 18],
    sway: [18, 38],
    swaySpeed: [0.3, 0.8],
    direction: -1,
    rotate: false,
    glow: 14,
    shape: 'circle',
  },
  autumn: {
    count: 46,
    colors: ['#e07a3f', '#c4602c', '#f2a65a', '#8a4a2a'],
    size: [6, 11],
    speedY: [22, 44],
    sway: [32, 60],
    swaySpeed: [0.4, 1.0],
    direction: 1,
    rotate: true,
    glow: 0,
    shape: 'leaf',
  },
}

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function makeParticle(cfg, w, h, seedY) {
  return {
    x: rand(0, w),
    y: seedY ? rand(0, h) : cfg.direction === 1 ? -20 : h + 20,
    size: rand(cfg.size[0], cfg.size[1]),
    speedY: rand(cfg.speedY[0], cfg.speedY[1]) * cfg.direction,
    swayAmp: rand(cfg.sway[0], cfg.sway[1]),
    swaySpeed: rand(cfg.swaySpeed[0], cfg.swaySpeed[1]),
    swayPhase: rand(0, Math.PI * 2),
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-1, 1) * 0.8,
    color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
    opacity: rand(0.45, 0.95),
  }
}

function drawParticle(ctx, p, cfg) {
  ctx.save()
  ctx.translate(p.x, p.y)
  if (cfg.rotate) ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color
  if (cfg.glow) {
    ctx.shadowColor = p.color
    ctx.shadowBlur = cfg.glow
  }

  if (cfg.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, p.size, 0, Math.PI * 2)
    ctx.fill()
  } else if (cfg.shape === 'petal') {
    ctx.beginPath()
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (cfg.shape === 'leaf') {
    ctx.beginPath()
    ctx.moveTo(0, -p.size)
    ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size)
    ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size)
    ctx.fill()
  }
  ctx.restore()
}

export default function SeasonOverlay({ enabled }) {
  const canvasRef = useRef(null)
  const { season } = useSeason()
  const stateRef = useRef({ particles: [], w: 0, h: 0, cfg: null })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (!enabled) return

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

    let last = performance.now()
    const loop = (now) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const { particles, w, h, cfg } = stateRef.current
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.y += p.speedY * dt
        p.x += Math.sin(now * 0.001 * p.swaySpeed + p.swayPhase) * cfg.sway[0] * 0.02
        if (cfg.rotate) p.rotation += p.rotSpeed * dt

        const offscreenBottom = cfg.direction === 1 && p.y > h + 20
        const offscreenTop = cfg.direction === -1 && p.y < -20
        if (offscreenBottom || offscreenTop) {
          Object.assign(p, makeParticle(cfg, w, h, false))
        }
        drawParticle(ctx, p, cfg)
      }

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
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [season, enabled])

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[85]"
    />
  )
}
