import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TriangleAlert, Compass, CircleCheck, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

const SECTIONS = [
  { key: 'problem', icon: TriangleAlert, fr: 'Le problème', en: 'The problem' },
  { key: 'approach', icon: Compass, fr: "L'approche", en: 'The approach' },
  { key: 'result', icon: CircleCheck, fr: 'Le résultat', en: 'The result' },
]

/**
 * CaseStudyModal — étude de cas complète (problème → approche → résultat)
 * pour un projet phare, en overlay plein écran par-dessus le portfolio.
 * Le scroll Lenis de fond est mis en pause tant qu'elle est ouverte.
 */
export default function CaseStudyModal({ project, onClose }) {
  const { lang } = useLanguage()

  useEffect(() => {
    if (!project) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-abyss/80 backdrop-blur-md md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        >
          <motion.article
            className="relative my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-titanium/10 bg-surface shadow-2xl md:my-0"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-titanium/15 bg-abyss/50 text-titanium/80 backdrop-blur-md transition-colors hover:border-accent-400/50 hover:text-accent-400"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {project.image && (
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="p-8 md:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded border border-titanium/10 bg-titanium/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-titanium/50">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-grotesk text-3xl font-extrabold tracking-tight text-titanium md:text-4xl">
                {project.title}
              </h3>

              <div className="mt-8 space-y-7">
                {SECTIONS.map(({ key, icon: Icon, fr, en }) => (
                  <div key={key}>
                    <div className="mb-2 flex items-center gap-2 text-accent-400">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{lang === 'fr' ? fr : en}</span>
                    </div>
                    <p className="max-w-xl text-sm leading-relaxed text-titanium/70">
                      {project.caseStudy[key][lang]}
                    </p>
                  </div>
                ))}
              </div>

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/cta mt-9 inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/[0.06] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-400 transition-colors hover:border-accent-400/60"
                >
                  {lang === 'fr' ? 'Voir le site' : 'Visit site'}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" strokeWidth={1.75} />
                </a>
              )}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
