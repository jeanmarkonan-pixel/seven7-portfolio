import MagneticText from '../ui/MagneticText'
import { ArrowDown } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

/**
 * Hero — titre magnétique géant sur le champ de particules WebGL.
 * Positionnement réel SEVEN7, bilingue FR/EN.
 */
export default function Hero({ visible }) {
  const { lang } = useLanguage()

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6" id="hero">
      <div
        className={`transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.5em] text-cyan-200/70">
          {lang === 'fr' ? 'Vibecoder & Développeur Web' : 'Vibecoder & Web Developer'}
        </p>

        <MagneticText
          text="SEVEN7"
          revealDelay={0.15}
          className="text-center font-grotesk text-[clamp(64px,17vw,220px)] font-black leading-[0.9] tracking-tight text-titanium"
        />

        <p className="mx-auto mt-8 max-w-xl text-center font-serif text-lg italic leading-relaxed text-titanium/60 md:text-xl">
          {lang === 'fr'
            ? "L'IA au service de votre performance métier — automatisation, tableaux de bord et outils numériques sur-mesure."
            : 'AI at the service of your business performance — automation, dashboards and custom digital tools.'}
        </p>

        {/* Badge disponibilité */}
        <div className="mt-10 flex justify-center">
          <span className="flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-300/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {lang === 'fr' ? 'Disponible pour vos projets' : 'Available for projects'}
          </span>
        </div>
      </div>

      <div
        className={`absolute bottom-10 flex flex-col items-center gap-3 transition-opacity delay-700 duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
        data-cursor-label="Scroll"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-titanium/40">
          {lang === 'fr' ? 'Défiler' : 'Scroll'}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-titanium/50" strokeWidth={1.5} />
      </div>
    </section>
  )
}
