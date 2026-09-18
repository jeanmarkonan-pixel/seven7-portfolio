import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight, Mail, Phone, Github } from 'lucide-react'

/**
 * MagneticFooter — CTA géant avec bouton magnétique (attiré par le curseur)
 * et grande typographie serif/grotesk.
 */
export default function MagneticFooter() {
  const buttonRef = useRef(null)
  const wrapRef = useRef(null)

  // Magnétisme du bouton CTA
  useEffect(() => {
    const wrap = wrapRef.current
    const btn = buttonRef.current
    if (!wrap || !btn) return

    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const radius = Math.max(rect.width, rect.height) * 0.9
      if (dist < radius) {
        const pull = 0.35 * (1 - dist / radius)
        xTo(dx * pull)
        yTo(dy * pull)
      } else {
        xTo(0)
        yTo(0)
      }
    }

    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <footer className="relative flex min-h-screen flex-col justify-between px-6 pb-10 pt-32 md:px-16" id="contact">
      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-cyan-200/70">
          Contact
        </p>
        <h2 className="max-w-4xl font-grotesk text-[clamp(40px,9vw,120px)] font-black leading-[0.95] tracking-tight text-titanium">
          LET'S CREATE
          <br />
          <span className="font-serif font-medium italic text-transparent" style={{ WebkitTextStroke: '1.5px rgba(237,237,237,0.85)' }}>
            magic
          </span>{' '}
          TOGETHER
        </h2>
      </div>

      {/* CTA magnétique */}
      <div ref={wrapRef} className="my-16 flex justify-center">
        <a
          ref={buttonRef}
          href="mailto:jeanmarkonan@gmail.com"
          className="group flex h-40 w-40 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md transition-colors duration-500 hover:border-cyan-200/60 hover:bg-cyan-200/10 md:h-48 md:w-48"
          data-cursor-label="Go"
        >
          <span className="flex flex-col items-center gap-2 text-center">
            <ArrowUpRight className="h-6 w-6 text-cyan-200 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/70">
              Démarrer
            </span>
          </span>
        </a>
      </div>

      {/* Barre de contact */}
      <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-6">
          <a href="mailto:jeanmarkonan@gmail.com" className="flex items-center gap-2 font-mono text-xs text-titanium/50 transition-colors hover:text-cyan-200">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            jeanmarkonan@gmail.com
          </a>
          <a href="tel:+2250789746930" className="flex items-center gap-2 font-mono text-xs text-titanium/50 transition-colors hover:text-cyan-200">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
            +225 07 89 74 69 30
          </a>
          <span className="flex items-center gap-2 font-mono text-xs text-titanium/30">
            <Github className="h-3.5 w-3.5" strokeWidth={1.5} />
            seven7-backend
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/30">
          © 2026 SEVEN7 — Crafted with passion & AI
        </p>
      </div>
    </footer>
  )
}
