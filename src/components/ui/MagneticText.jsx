import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * MagneticText — titre cinétique dont chaque lettre est attirée par le curseur
 * (effet magnétique) avec retour élastique. Révélation par masque au montage.
 */
export default function MagneticText({ text, className = '', as: Tag = 'h1', revealDelay = 0 }) {
  const containerRef = useRef(null)

  // Révélation par masque (clip-path) lettre par lettre
  useEffect(() => {
    const letters = containerRef.current?.querySelectorAll('.mag-letter')
    if (!letters?.length) return
    const tween = gsap.fromTo(
      letters,
      { yPercent: 120, rotateX: -60, opacity: 0 },
      {
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.045,
        delay: revealDelay,
      }
    )
    return () => tween.kill()
  }, [revealDelay])

  // Effet magnétique par lettre
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const letters = [...container.querySelectorAll('.mag-letter-inner')]
    const setters = letters.map((el) => ({
      x: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' }),
      el,
    }))

    const onMove = (e) => {
      setters.forEach(({ x, y, el }) => {
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
        const radius = 130
        if (dist < radius) {
          const force = (1 - dist / radius) * 34
          x(((e.clientX - cx) / dist) * force)
          y(((e.clientY - cy) / dist) * force)
        } else {
          x(0)
          y(0)
        }
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <Tag ref={containerRef} className={`${className}`} aria-label={text} style={{ perspective: '600px' }}>
      {text.split('').map((ch, i) => (
        <span key={i} className="mag-letter inline-block overflow-hidden align-bottom" aria-hidden="true">
          <span className="mag-letter-inner inline-block will-change-transform">
            {ch === ' ' ? ' ' : ch}
          </span>
        </span>
      ))}
    </Tag>
  )
}
