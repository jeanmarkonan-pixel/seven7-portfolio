import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LINKS = [
  { fr: 'Services', en: 'Services', target: '#services' },
  { fr: 'Projets', en: 'Work', target: '#work' },
  { fr: 'À propos', en: 'About', target: '#lab' },
  { fr: 'Contact', en: 'Contact', target: '#contact' },
]

/**
 * Nav — barre fixe minimaliste en mix-blend-difference.
 * Apparition après le preloader, navigation pilotée par Lenis, toggle FR/EN.
 */
export default function Nav({ visible, scrollTo, lang, toggleLang }) {
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

      <div className="flex items-center gap-6 md:gap-8">
        {LINKS.map(({ fr, en, target }) => (
          <button
            key={target}
            onClick={() => scrollTo(target)}
            className="group relative hidden font-mono text-[11px] uppercase tracking-[0.3em] text-titanium/70 transition-colors hover:text-titanium sm:block"
          >
            {lang === 'fr' ? fr : en}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-200 transition-all duration-300 group-hover:w-full" />
          </button>
        ))}

        {/* Toggle langue */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-full border border-titanium/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-titanium/80 transition-colors hover:border-cyan-200/60 hover:text-cyan-200"
          aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
        >
          <span className={lang === 'fr' ? 'text-cyan-200' : 'text-titanium/40'}>FR</span>
          <span className="text-titanium/30">/</span>
          <span className={lang === 'en' ? 'text-cyan-200' : 'text-titanium/40'}>EN</span>
        </button>
      </div>
    </nav>
  )
}
