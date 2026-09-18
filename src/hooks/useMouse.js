import { useEffect, useRef } from 'react'

/**
 * Position souris lissée (lerp) + vélocité normalisée.
 * Les valeurs sont écrites dans des refs mutables lues par les shaders
 * sans re-render React — zéro coût sur la boucle de rendu.
 */
export function useMouse() {
  const mouse = useRef({
    x: 0, y: 0,           // position lissée (NDC -1..1)
    rawX: 0, rawY: 0,     // position brute
    vx: 0, vy: 0,         // vélocité normalisée
    speed: 0,             // magnitude lissée
  })

  useEffect(() => {
    let lastX = 0
    let lastY = 0
    let lastT = performance.now()
    let raf = null
    const m = mouse.current

    const onMove = (e) => {
      const t = performance.now()
      const dt = Math.max(t - lastT, 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      m.rawX = x
      m.rawY = y
      // vélocité instantanée en px/ms, normalisée
      const dx = (e.clientX - lastX) / dt
      const dy = (e.clientY - lastY) / dt
      m.vx = m.vx * 0.9 + dx * 0.1
      m.vy = m.vy * 0.9 + dy * 0.1
      lastX = e.clientX
      lastY = e.clientY
      lastT = t
    }

    const tick = () => {
      // lerp position
      m.x += (m.rawX - m.x) * 0.08
      m.y += (m.rawY - m.y) * 0.08
      // decay de la vélocité quand la souris s'arrête
      m.vx *= 0.94
      m.vy *= 0.94
      const target = Math.min(Math.hypot(m.vx, m.vy) * 3, 1.5)
      m.speed += (target - m.speed) * 0.1
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return mouse
}
