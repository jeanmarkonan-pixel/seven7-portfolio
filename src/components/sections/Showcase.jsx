import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import { MoveHorizontal } from 'lucide-react'
import ProjectCard from '../canvas/ProjectCard'
import { PROJECTS } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'

gsap.registerPlugin(ScrollTrigger)

const FOCUS_SPAN = 0.62 // fraction de la largeur d'écran sur laquelle la mise au point se dissipe

/**
 * Showcase — défilement horizontal épinglé, façon "carrousel cinématique" :
 * la carte au centre de l'écran passe nette/pleine échelle, les autres
 * reculent en flou/désaturation/échelle réduite selon leur distance,
 * avec un compteur odomètre + une piste de progression à pastilles.
 */
export default function Showcase() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(null)
  const hintRef = useRef(null)
  const cardRefs = useRef([])
  const activeIndexRef = useRef(0)
  const { lang } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)

  const registerCard = useCallback((i) => (el) => {
    cardRefs.current[i] = el
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const getDistance = () => track.scrollWidth - window.innerWidth
    let hintHidden = false

    const applyFocus = () => {
      const center = window.innerWidth / 2
      const span = window.innerWidth * FOCUS_SPAN
      let nearestIndex = 0
      let nearestDist = Infinity

      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.left + rect.width / 2
        const dist = Math.abs(cardCenter - center)
        const focus = 1 - Math.min(dist / span, 1)
        gsap.set(card, {
          scale: 0.88 + focus * 0.14,
          opacity: 0.38 + focus * 0.62,
          filter: `blur(${(1 - focus) * 2.2}px) saturate(${0.5 + focus * 0.5})`,
        })
        if (i < PROJECTS.length && dist < nearestDist) {
          nearestDist = dist
          nearestIndex = i
        }
      })

      if (nearestIndex !== activeIndexRef.current) {
        activeIndexRef.current = nearestIndex
        setActiveIndex(nearestIndex)
      }
    }

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
          if (!hintHidden && self.progress > 0.03 && hintRef.current) {
            hintHidden = true
            gsap.to(hintRef.current, { opacity: 0, y: -8, duration: 0.5, ease: 'power2.out' })
          }
          applyFocus()
        },
      },
    })

    applyFocus()

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

          <div className="hidden flex-col items-end gap-2 md:flex">
            {/* Compteur odomètre : bascule verticale du numéro actif */}
            <div className="flex items-baseline gap-2 font-mono text-titanium/70">
              <span className="relative h-7 w-8 overflow-hidden text-right">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={activeIndex}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-0 text-xl font-bold text-cyan-200"
                  >
                    {String(activeIndex + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-xs text-titanium/30">/ {String(PROJECTS.length).padStart(2, '0')}</span>
            </div>
            {/* Piste à pastilles */}
            <div className="flex items-center gap-1.5">
              {PROJECTS.map((p, i) => (
                <span
                  key={p.variant}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex ? 'w-6 bg-cyan-300 shadow-[0_0_8px_rgba(0,242,254,0.6)]' : i < activeIndex ? 'w-1.5 bg-cyan-300/50' : 'w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Indice de défilement */}
        <div ref={hintRef} className="pointer-events-none absolute left-6 top-[7.5rem] flex items-center gap-2 text-titanium/35 md:left-16">
          <MoveHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {lang === 'fr' ? 'Défiler pour explorer' : 'Scroll to explore'}
          </span>
        </div>

        {/* Piste horizontale */}
        <div ref={trackRef} className="flex gap-10 px-6 will-change-transform md:px-16">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.variant} ref={registerCard(i)} project={project} index={i} lang={lang} />
          ))}

          {/* Carte finale CTA */}
          <div
            ref={registerCard(PROJECTS.length)}
            className="flex w-[60vw] max-w-[480px] flex-shrink-0 items-center justify-center"
          >
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
