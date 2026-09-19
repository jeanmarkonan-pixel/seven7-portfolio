import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

const LINKS = [
  { fr: 'Services', en: 'Services', target: '#services' },
  { fr: 'Projets', en: 'Work', target: '#work' },
  { fr: 'Méthode', en: 'Method', target: '#method' },
  { fr: 'À propos', en: 'About', target: '#lab' },
  { fr: 'Contact', en: 'Contact', target: '#contact' },
]

/**
 * Nav — barre fixe minimaliste en mix-blend-difference.
 * Apparition après le preloader, navigation pilotée par Lenis, toggle FR/EN.
 */
export default function Nav({ visible, scrollTo, lang, toggleLang }) {
  const navRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

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
        className="font-grotesk text-lg font-black tracking-tight text-white"
        data-cursor-label="Top"
      >
        SEVEN<span className="text-accent-400">7</span>
      </button>

      <div className="flex items-center gap-6 md:gap-8">
        {LINKS.map(({ fr, en, target }) => (
          <button
            key={target}
            onClick={() => scrollTo(target)}
            className="group relative hidden font-mono text-[11px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white sm:block"
          >
            {lang === 'fr' ? fr : en}
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-400 transition-all duration-300 group-hover:w-full" />
          </button>
        ))}

        {/* Toggle langue */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 transition-colors hover:border-accent-400/60 hover:text-accent-400"
          aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
        >
          <span className={lang === 'fr' ? 'text-accent-400' : 'text-white/40'}>FR</span>
          <span className="text-white/30">/</span>
          <span className={lang === 'en' ? 'text-accent-400' : 'text-white/40'}>EN</span>
        </button>

        {/* Toggle thème clair/sombre */}
        <button
          onClick={toggleTheme}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-accent-400/60 hover:text-accent-400"
          aria-label={theme === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair'}
          data-cursor-label={theme === 'light' ? 'Sombre' : 'Clair'}
        >
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />}
        </button>
      </div>
    </nav>
  )
}
