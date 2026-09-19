import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Globe, ClipboardCheck, AppWindow, PenTool, Sparkles, Wrench, Check } from 'lucide-react'
import { SERVICES } from '../../data/services'
import { useLanguage } from '../../hooks/useLanguage'

gsap.registerPlugin(ScrollTrigger)

const ICONS = { Globe, ClipboardCheck, AppWindow, PenTool, Sparkles, Wrench }

/**
 * Services — grille des 6 offres réelles SEVEN7, révélées au scroll.
 */
export default function Services({ visible }) {
  const gridRef = useRef(null)
  const { lang } = useLanguage()

  useEffect(() => {
    if (!visible || !gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.service-card')
    const tween = gsap.fromTo(
      cards,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
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
    <section className="relative px-6 py-32 md:px-16" id="services">
      <div className="mb-16 flex items-end justify-between">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-cyan-200/70">
            {lang === 'fr' ? 'Ce que je propose' : 'What I offer'}
          </p>
          <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
            SERVICES
          </h2>
        </div>
        <span className="hidden font-mono text-xs text-titanium/30 md:block">
          06 — {lang === 'fr' ? 'Offres' : 'Offers'}
        </span>
      </div>

      <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = ICONS[service.icon] || Globe
          const content = service[lang]
          return (
            <div
              key={service.icon}
              className="service-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-cyan-200/40 hover:bg-white/[0.04]"
            >
              {/* Liseré supérieur au hover */}
              <div className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-cyan-300 to-violet-500 transition-transform duration-500 group-hover:scale-x-100" />

              <div className="mb-6 flex h-13 w-13 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] p-3 text-cyan-200">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>

              <h3 className="mb-3 font-grotesk text-xl font-extrabold tracking-tight text-titanium">
                {content.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-titanium/50">
                {content.desc}
              </p>

              <ul className="mb-6 flex flex-col gap-2">
                {content.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-xs text-titanium/40">
                    <Check className="h-3 w-3 flex-shrink-0 text-cyan-200/70" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <span className="inline-block rounded-full border border-violet-400/40 bg-violet-400/[0.06] px-4 py-1.5 font-mono text-xs text-cyan-200/90">
                {lang === 'fr' ? 'Devis sur demande' : 'Quote on request'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
