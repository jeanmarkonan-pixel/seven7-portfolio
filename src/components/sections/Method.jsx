import { useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Sparkles, RefreshCw, Rocket } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

const STEPS = [
  {
    icon: MessageSquare,
    tools: ['Discovery call', 'Figma'],
    fr: {
      title: 'Cadrage',
      desc: "Un échange direct pour comprendre le besoin réel — pas un cahier des charges figé, mais une conversation qui pose les bonnes questions dès le départ.",
    },
    en: {
      title: 'Discovery',
      desc: 'A direct conversation to understand the real need — not a rigid spec sheet, but a discussion that asks the right questions from day one.',
    },
  },
  {
    icon: Sparkles,
    tools: ['Claude Code', 'React', 'Three.js'],
    fr: {
      title: 'Vibecoding',
      desc: "Je construis avec l'IA comme copilote : prototypage rapide, code lisible et compris ligne par ligne — la vitesse ne remplace jamais la rigueur.",
    },
    en: {
      title: 'Vibecoding',
      desc: 'I build with AI as a copilot: fast prototyping, code that stays readable and understood line by line — speed never replaces rigor.',
    },
  },
  {
    icon: RefreshCw,
    tools: ['Aperçus live', 'Retours directs'],
    fr: {
      title: 'Itération',
      desc: "Vous voyez le produit évoluer à chaque étape et validez ou réorientez — des cycles de retour bien plus courts qu'un développement classique.",
    },
    en: {
      title: 'Iteration',
      desc: 'You see the product evolve at every step and validate or redirect it — feedback loops much shorter than traditional development.',
    },
  },
  {
    icon: Rocket,
    tools: ['Firebase', 'Vercel'],
    fr: {
      title: 'Déploiement & suivi',
      desc: "Mise en ligne sur une infrastructure fiable, avec un accompagnement dans la durée plutôt qu'une livraison unique et sans suite.",
    },
    en: {
      title: 'Ship & support',
      desc: 'Deployed on reliable infrastructure, with ongoing support rather than a one-shot delivery.',
    },
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

/**
 * Method — "comment je travaille" : 4 étapes du processus vibecoding,
 * reliées par une ligne de progression qui se dessine au scroll.
 */
export default function Method() {
  const { lang } = useLanguage()
  const lineRef = useRef(null)

  return (
    <section className="relative px-6 py-32 md:px-16" id="method">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-20 flex items-end justify-between"
      >
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-accent-400/70">
            {lang === 'fr' ? 'Comment je travaille' : 'How I work'}
          </p>
          <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
            {lang === 'fr' ? 'MÉTHODE' : 'METHOD'}
          </h2>
        </div>
        <span className="hidden font-mono text-xs text-titanium/30 md:block">
          04 — {lang === 'fr' ? 'Étapes' : 'Steps'}
        </span>
      </motion.div>

      <div className="relative">
        {/* Ligne de progression (desktop) */}
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-titanium/10 md:block">
          <motion.div
            ref={lineRef}
            className="h-full origin-left bg-gradient-to-r from-accent-300 via-cascade-2 to-accent-300"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="grid gap-8 md:grid-cols-4 md:gap-6">
          {STEPS.map(({ icon: Icon, tools, fr, en }, i) => {
            const content = lang === 'fr' ? fr : en
            return (
              <motion.div
                key={content.title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                className="relative"
              >
                <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-titanium/15 bg-surface text-accent-400 md:mb-6">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className="mb-2 block font-mono text-[10px] text-accent-400/60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2 font-grotesk text-xl font-bold tracking-tight text-titanium">
                  {content.title}
                </h3>
                <p className="mb-4 max-w-xs text-sm leading-relaxed text-titanium/60">
                  {content.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((tool) => (
                    <span key={tool} className="rounded border border-titanium/10 bg-titanium/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-titanium/50">
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
