import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectCard from '../canvas/ProjectCard'
import { PROJECTS } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'

gsap.registerPlugin(ScrollTrigger)

/**
 * Showcase — défilement horizontal épinglé avec les vrais projets SEVEN7.
 * Le scroll vertical Lenis pilote la translation X via ScrollTrigger.
 */
export default function Showcase() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(null)
  const { lang } = useLanguage()

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const getDistance = () => track.scrollWidth - window.innerWidth

    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden" id="work">
      <div className="flex min-h-screen flex-col justify-center py-24">
        {/* En-tête */}
        <div className="mb-14 flex items-end justify-between px-6 md:px-16">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-cyan-200/70">
              {lang === 'fr' ? 'Ce que j\'ai construit' : 'What I built'}
            </p>
            <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
              PROJETS
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-titanium/30 md:block">
            {String(PROJECTS.length).padStart(2, '0')} — {lang === 'fr' ? 'Projets' : 'Projects'}
          </span>
        </div>

        {/* Piste horizontale */}
        <div ref={trackRef} className="flex gap-10 px-6 will-change-transform md:px-16">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.variant} project={project} index={i} lang={lang} />
          ))}

          {/* Carte finale CTA */}
          <div className="flex w-[60vw] max-w-[480px] flex-shrink-0 items-center justify-center">
            <p className="max-w-xs text-center font-serif text-2xl italic leading-relaxed text-titanium/50">
              {lang === 'fr' ? (
                <>Votre projet pourrait être le <span className="text-cyan-200">prochain</span>.</>
              ) : (
                <>Your project could be <span className="text-cyan-200">next</span>.</>
              )}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mx-6 mt-16 h-px bg-white/10 md:mx-16">
          <div
            ref={progressRef}
            className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan-300 to-violet-500"
          />
        </div>
      </div>
    </section>
  )
}
