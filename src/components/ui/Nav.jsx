import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LINKS = [
  { label: 'Travaux', target: '#work' },
  { label: 'Lab', target: '#lab' },
  { label: 'Contact', target: '#contact' },
]

/**
 * Nav — barre fixe minimaliste en mix-blend-difference.
 * Apparition après le preloader, navigation pilotée par Lenis.
 */
export default function Nav({ visible, scrollTo }) {
  const navRef = useRef(null)

  useEffect(() => {
    if (!visible || !navRef.current) return
    const tween = gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    )
    return () => tween.kill()
  }, [visible])

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-6 py-5 opacity-0 mix-blend-difference md:px-16"
      aria-label="Navigation principale"
    >
      <button
        onClick={() => scrollTo(0)}
        className="font-grotesk text-lg font-black tracking-tight text-titanium"
        data-cursor-label="Top"
      >
        SEVEN<span className="text-cyan-200">7</span>
      </button>

      <div className="flex items-center gap-8">
        {LINKS.map(({ label, target }) => (
          <button
            key={target}
            onClick={() => scrollTo(target)}
            className="group relative font-mono text-[11px] uppercase tracking-[0.3em] text-titanium/70 transition-colors hover:text-titanium"
          >
            {label}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-200 transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
      </div>
    </nav>
  )
}
