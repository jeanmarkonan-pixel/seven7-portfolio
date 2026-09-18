import MagneticText from '../ui/MagneticText'
import { ArrowDown } from 'lucide-react'

/**
 * Hero — titre magnétique géant sur le champ de particules WebGL.
 */
export default function Hero({ visible }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6" id="hero">
      <div
        className={`transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.5em] text-cyan-200/70">
          Creative Technologist — Portfolio
        </p>

        <MagneticText
          text="SEVEN7"
          revealDelay={0.15}
          className="text-center font-grotesk text-[clamp(64px,17vw,220px)] font-black leading-[0.9] tracking-tight text-titanium"
        />

        <p className="mx-auto mt-8 max-w-xl text-center font-serif text-lg italic leading-relaxed text-titanium/60 md:text-xl">
          Des expériences web hors du commun — shaders WebGL, interactions
          cinématographiques et design hyper-réaliste.
        </p>
      </div>

      <div
        className={`absolute bottom-10 flex flex-col items-center gap-3 transition-opacity delay-700 duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
        data-cursor-label="Scroll"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-titanium/40">
          Défiler
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-titanium/50" strokeWidth={1.5} />
      </div>
    </section>
  )
}
