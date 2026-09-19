import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Globe, ClipboardCheck, AppWindow, RotateCcw, ArrowUpRight } from 'lucide-react'
import { QUESTIONS, RESULTS } from '../../data/finder'
import { SERVICES } from '../../data/services'
import { PROJECTS } from '../../data/projects'
import { useLanguage } from '../../hooks/useLanguage'

const ICONS = { Globe, ClipboardCheck, AppWindow }

function computeWinner(scores) {
  const entries = Object.entries(scores)
  entries.sort((a, b) => b[1] - a[1])
  // égalité ou aucun signal : le pilier généraliste (SaaS/Cloud) sert de valeur par défaut
  return entries[0] && entries[0][1] > 0 ? entries[0][0] : 'saas'
}

/**
 * ProjectFinder — "Orienteur de projet" : questionnaire déterministe
 * (3 questions, scoring simple, aucun appel IA/API) qui recommande le
 * service le plus adapté au besoin du visiteur, avec un exemple concret.
 */
export default function ProjectFinder() {
  const { lang } = useLanguage()
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState({ web: 0, audit: 0, saas: 0 })
  const [done, setDone] = useState(false)

  const answer = useCallback(
    (optionScore) => {
      setScores((s) => {
        const next = { ...s }
        for (const [k, v] of Object.entries(optionScore)) next[k] = (next[k] || 0) + v
        return next
      })
      if (step + 1 >= QUESTIONS.length) setDone(true)
      else setStep((s) => s + 1)
    },
    [step]
  )

  const restart = useCallback(() => {
    setStep(0)
    setScores({ web: 0, audit: 0, saas: 0 })
    setDone(false)
  }, [])

  const winner = useMemo(() => (done ? computeWinner(scores) : null), [done, scores])
  const result = winner ? RESULTS[winner] : null
  const service = result ? SERVICES[result.serviceIndex] : null
  const example = result ? PROJECTS.find((p) => p.variant === result.exampleVariant) : null
  const ServiceIcon = service ? ICONS[service.icon] || Globe : Globe

  const goContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative px-6 py-32 md:px-16" id="finder">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-14 flex items-end justify-between"
      >
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-accent-400/70">
            {lang === 'fr' ? "Pas sûr par où commencer ?" : 'Not sure where to start?'}
          </p>
          <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
            {lang === 'fr' ? 'ORIENTEUR' : 'FINDER'}
          </h2>
        </div>
        <span className="hidden font-mono text-xs text-titanium/30 md:block">
          {lang === 'fr' ? '30 secondes' : '30 seconds'}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="mx-auto max-w-2xl rounded-3xl border border-titanium/10 bg-surface p-8 md:p-12"
      >
        {!done ? (
          <>
            <div className="mb-8 flex items-center gap-2">
              {QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === step ? 'w-8 bg-accent-400' : i < step ? 'w-1.5 bg-accent-400/50' : 'w-1.5 bg-titanium/15'
                  }`}
                />
              ))}
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-titanium/30">
                {step + 1} / {QUESTIONS.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="mb-6 font-grotesk text-2xl font-bold tracking-tight text-titanium md:text-3xl">
                  {QUESTIONS[step][lang].text}
                </h3>
                <div className="grid gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.fr}
                      type="button"
                      onClick={() => answer(opt.score)}
                      className="group flex items-center justify-between rounded-xl border border-titanium/10 bg-titanium/[0.02] px-5 py-4 text-left text-sm text-titanium/80 transition-colors duration-300 hover:border-accent-400/40 hover:bg-accent-400/[0.04] hover:text-titanium"
                    >
                      {opt[lang]}
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-titanium/20 transition-colors group-hover:text-accent-400" strokeWidth={1.75} />
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center gap-2 text-accent-400">
              <Compass className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
                {lang === 'fr' ? 'Recommandé pour vous' : 'Recommended for you'}
              </span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-titanium/10 bg-titanium/[0.04]">
                <ServiceIcon className="h-6 w-6 text-accent-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-grotesk text-2xl font-extrabold tracking-tight text-titanium md:text-3xl">
                {service[lang].title}
              </h3>
            </div>
            <p className="mb-6 max-w-xl text-sm leading-relaxed text-titanium/60">
              {service[lang].desc}
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
              {service[lang].tags.map((tag) => (
                <span key={tag} className="rounded-full border border-titanium/10 bg-titanium/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-titanium/50">
                  {tag}
                </span>
              ))}
            </div>

            {example && (
              <div className="mb-8 rounded-xl border border-titanium/10 bg-titanium/[0.02] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-titanium/40">
                  {lang === 'fr' ? 'Exemple déjà construit' : 'Already built example'}
                </p>
                <p className="mt-1 text-sm font-semibold text-titanium">{example.title}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={goContact}
                className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/[0.06] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-400 transition-colors hover:border-accent-400/60"
              >
                {lang === 'fr' ? 'En discuter' : "Let's talk"}
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-titanium/40 transition-colors hover:text-titanium/70"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                {lang === 'fr' ? 'Recommencer' : 'Restart'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
