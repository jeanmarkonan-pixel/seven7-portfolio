import { lazy, Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../../hooks/useLanguage'

gsap.registerPlugin(ScrollTrigger)

const LabScene = lazy(() => import('../canvas/LabScene'))

const SKILLS = [
  'React', 'Three.js', 'GLSL', 'GSAP', 'Firebase', 'Node.js',
  'JavaScript', 'HTML/CSS', 'Figma', 'Prompt IA', 'SYSCOHADA', 'Vite',
]

/**
 * Lab / À propos — tore de verre + pastilles en apesanteur (WebGL),
 * vraie bio SEVEN7 et compétences réelles, bilingue FR/EN.
 */
export default function Lab({ visible }) {
  const listRef = useRef(null)
  const { lang } = useLanguage()

  useEffect(() => {
    if (!visible || !listRef.current) return
    const items = listRef.current.querySelectorAll('.skill-line')
    const tween = gsap.fromTo(
      items,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 78%',
          once: true,
        },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [visible])

  return (
    <section className="relative flex min-h-screen flex-col justify-center px-6 py-32 md:px-16" id="lab">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-accent-400/70">
        {lang === 'fr' ? 'Lab créatif' : 'Creative lab'}
      </p>
      <h2 className="mb-16 font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
        {lang === 'fr' ? 'À PROPOS' : 'ABOUT'}
      </h2>

      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Scène 3D du lab */}
        <div className="relative aspect-square w-full">
          <Suspense fallback={null}>
            {visible && <LabScene />}
          </Suspense>
        </div>

        {/* Bio + compétences */}
        <div ref={listRef}>
          <p className="mb-8 max-w-md font-serif text-lg italic leading-relaxed text-titanium/60">
            {lang === 'fr'
              ? "Vibecoder passionné, je combine créativité humaine et puissance de l'IA pour donner vie à des expériences web uniques. J'aide cabinets et entreprises à gagner en performance grâce à des outils numériques sur-mesure."
              : 'Passionate vibecoder, I combine human creativity and AI power to bring unique web experiences to life. I help firms and businesses boost their performance with custom digital tools.'}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {SKILLS.map((skill) => (
              <span key={skill} className="skill-line inline-block overflow-hidden">
                <span className="inline-block font-grotesk text-xl font-bold tracking-tight text-titanium/80 transition-colors hover:text-accent-400 md:text-2xl">
                  {skill}
                </span>
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-12 border-t border-titanium/10 pt-8">
            {[
              ['3+', lang === 'fr' ? 'Années d\'exp.' : 'Years exp.'],
              ['5+', lang === 'fr' ? 'Projets' : 'Projects'],
              ['100%', 'Passion'],
            ].map(([num, label]) => (
              <div key={label}>
                <div className="font-grotesk text-4xl font-black text-titanium">{num}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/40">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
