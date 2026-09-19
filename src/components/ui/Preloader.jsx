import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#@%&7'

/**
 * Preloader cinématique :
 * 1. Compteur 0→100 avec scramble typographique glitché
 * 2. Curtain wipe : 5 lamelles verticales qui s'ouvrent en cascade
 */
export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const containerRef = useRef(null)
  const counterRef = useRef(null)
  const brandRef = useRef(null)

  // Scramble du mot SEVEN7 pendant le chargement
  useEffect(() => {
    const el = brandRef.current
    if (!el) return
    const target = 'SEVEN7'
    let frame = 0
    const interval = setInterval(() => {
      frame++
      el.textContent = target
        .split('')
        .map((ch, i) => {
          if (frame > i * 6 + 14) return ch
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')
      if (frame > target.length * 6 + 20) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  // Compteur + séquence de sortie
  useEffect(() => {
    const state = { value: 0 }
    const tl = gsap.timeline()

    tl.to(state, {
      value: 100,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => setProgress(Math.floor(state.value)),
    })
      // flash du compteur
      .to(counterRef.current, { scale: 1.12, duration: 0.18, ease: 'power3.out' }, '>-0.1')
      .to(counterRef.current, { scale: 1, duration: 0.3, ease: 'power3.inOut' })
      // texte et compteur s'évanouissent
      .to([counterRef.current, brandRef.current], {
        opacity: 0,
        y: -40,
        filter: 'blur(12px)',
        duration: 0.6,
        ease: 'power3.in',
        stagger: 0.08,
      })
      // curtain wipe : lamelles en cascade
      .to(containerRef.current.querySelectorAll('.curtain-blade'), {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.9,
        ease: 'power4.inOut',
        stagger: 0.07,
      }, '-=0.15')
      .set(containerRef.current, { display: 'none' })
      .call(() => onComplete?.())

    return () => tl.kill()
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      aria-label="Chargement du portfolio"
    >
      {/* Lamelles du rideau */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="curtain-blade absolute top-0 h-full bg-abyss"
          style={{ left: `${i * 20}%`, width: '20.5%' }}
        />
      ))}

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div
          ref={brandRef}
          className="font-mono text-sm tracking-[0.6em] text-titanium/60 uppercase"
        >
          SEVEN7
        </div>
        <div
          ref={counterRef}
          className="font-grotesk text-[clamp(80px,18vw,200px)] font-black leading-none text-titanium tabular-nums"
          style={{ fontVariationSettings: '"wdth" 125' }}
        >
          {String(progress).padStart(3, '0')}
          <span className="text-[0.25em] align-top text-titanium/40">%</span>
        </div>
        <div className="h-px w-48 bg-titanium/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-300 to-cascade-2 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
