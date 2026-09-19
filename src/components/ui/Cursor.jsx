import { useEffect, useRef } from 'react'

/**
 * Curseur custom — point central + anneau traînant.
 * Se transforme en lentille (scale + blur inversé) sur les éléments
 * portant [data-cursor="lens"], et en label sur [data-cursor-label].
 * Positionnement direct via transform (hors flux React → 60 FPS).
 */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    let x = -100, y = -100        // dot (rapide)
    let rx = -100, ry = -100      // ring (lerp lent)
    let raf = null
    let mode = 'default'

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY

      const lensTarget = e.target.closest?.('[data-cursor="lens"]')
      const labelTarget = e.target.closest?.('[data-cursor-label]')
      const newMode = lensTarget ? 'lens' : labelTarget ? 'label' : 'default'

      if (newMode !== mode) {
        mode = newMode
        ring.classList.toggle('cursor-lens', mode === 'lens')
        ring.classList.toggle('cursor-label', mode === 'label')
        // Le blend-mode n'a de sens que pour l'anneau par défaut (contour
        // fin) : il assure un contraste adaptatif sur fond sombre (Hero)
        // comme clair (reste du site). Les états lentille/label ont leur
        // propre fond opaque et ne doivent pas être inversés en couleur.
        ring.classList.toggle('mix-blend-difference', mode === 'default')
        dot.classList.toggle('opacity-0', mode !== 'default')
        if (mode === 'label') {
          label.textContent = labelTarget.dataset.cursorLabel
        }
      }
    }

    const tick = () => {
      rx += (x - rx) * 0.14
      ry += (y - ry) * 0.14
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference transition-opacity duration-200"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[98] flex h-9 w-9 items-center justify-center rounded-full border border-white/40 mix-blend-difference transition-[width,height,background-color,border-color,backdrop-filter] duration-300 ease-out"
        aria-hidden="true"
      >
        <span
          ref={labelRef}
          className="font-mono text-[10px] uppercase tracking-widest text-abyss opacity-0 transition-opacity duration-200"
        />
      </div>
    </>
  )
}
