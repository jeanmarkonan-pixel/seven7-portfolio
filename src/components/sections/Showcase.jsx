import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectCard from '../canvas/ProjectCard'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    variant: 'cola',
    title: 'Coca-Cola Liquid Experience',
    category: 'WebGL / 3D',
    description: 'Expérience 3D fluide & fraîcheur — simulation liquide en temps réel et matière cristalline.',
  },
  {
    variant: 'nike',
    title: 'Nike Cyber Velocity',
    category: 'Campagne interactive',
    description: 'Chaussures en apesanteur, trajectoires néon et physique zero-g pour un lancement immersif.',
  },
  {
    variant: 'aether',
    title: 'Aether Spatial OS',
    category: 'Interface spatiale',
    description: 'UI holographique flottante, panneaux de verre et navigation gestuelle dans l\'espace.',
  },
  {
    variant: 'lumina',
    title: 'Lumina High Jewelry',
    category: 'Rendu luxe',
    description: 'Réfraction de diamants, dispersion spectrale et écrin numérique pour haute joaillerie.',
  },
]

/**
 * Showcase — défilement horizontal épinglé.
 * Le scroll vertical Lenis pilote la translation X via ScrollTrigger.
 */
export default function Showcase() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(null)

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
        scrub: 1.2,               // friction réaliste
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
              Travaux sélectionnés
            </p>
            <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
              SHOWCASE
            </h2>
          </div>
          <span className="hidden font-mono text-xs text-titanium/30 md:block">
            04 — Projets
          </span>
        </div>

        {/* Piste horizontale */}
        <div ref={trackRef} className="flex gap-10 px-6 will-change-transform md:px-16">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.variant} project={project} index={i} />
          ))}

          {/* Carte finale CTA */}
          <div className="flex w-[60vw] max-w-[480px] flex-shrink-0 items-center justify-center">
            <p className="max-w-xs text-center font-serif text-2xl italic leading-relaxed text-titanium/50">
              Votre projet pourrait être le{' '}
              <span className="text-cyan-200">prochain</span>.
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
