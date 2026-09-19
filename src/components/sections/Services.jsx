import { useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Globe, ClipboardCheck, AppWindow } from 'lucide-react'
import { SERVICES } from '../../data/services'
import { useLanguage } from '../../hooks/useLanguage'
import ServicePanelVisual from './ServicePanelVisual'
import MagneticCTA from './MagneticCTA'

const ICONS = { Globe, ClipboardCheck, AppWindow }
const PANEL_SPRING = { type: 'spring', stiffness: 260, damping: 22, mass: 0.9 }
const NUMBER_SPRING = { type: 'spring', stiffness: 200, damping: 18 }

const contentVariants = {
  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
}
const itemVariants = {
  closed: { opacity: 0, y: 14, filter: 'blur(2px)' },
  open: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

function widthFor(index, activeIndex) {
  if (activeIndex === null) return '33.3333%'
  if (activeIndex === index) return '55%'
  return '22.5%'
}

/** Inclinaison 3.5D : le panneau actif fait face, les autres basculent en éventail. */
function tiltFor(index, activeIndex) {
  if (activeIndex === null || activeIndex === index) return 0
  return index < activeIndex ? 10 : -10
}

/**
 * Panel — un pilier de service. Largeur + tilt 3D pilotés par le parent
 * (desktop), pleine largeur + hauteur animée en accordéon sur mobile.
 */
function Panel({ service, index, activeIndex, onEnter, onLeave, onToggle, lang, isMobile, reduceMotion }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const Icon = ICONS[service.icon] || Globe
  const content = service[lang]
  const isActive = activeIndex === index
  const isDimmed = !isMobile && activeIndex !== null && !isActive
  const num = String(index + 1).padStart(2, '0')

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--mx', `${px}%`)
    e.currentTarget.style.setProperty('--my', `${py}%`)
    setOffset({ x: px / 100 - 0.5, y: py / 100 - 0.5 })
  }, [])

  const interactiveAnimate = isMobile || reduceMotion
    ? undefined
    : {
        width: widthFor(index, activeIndex),
        rotateY: tiltFor(index, activeIndex),
        scale: isActive ? 1.02 : activeIndex !== null ? 0.96 : 1,
      }
  const staticWidth = !isMobile && reduceMotion ? widthFor(index, activeIndex) : undefined

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, rotateX: -12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, rotateX: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      animate={interactiveAnimate}
      transition={{
        opacity: { duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] },
        rotateX: { duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] },
        width: PANEL_SPRING,
        rotateY: PANEL_SPRING,
        scale: PANEL_SPRING,
      }}
      whileTap={{ scale: 0.985 }}
      className={`pulse-panel group relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-colors duration-500 md:p-10 ${
        isMobile ? '' : 'min-h-[650px]'
      } ${isActive ? 'border-accent-400/40 bg-surface2 is-active' : 'border-titanium/10 bg-surface'} ${
        isDimmed ? 'opacity-70' : ''
      }`}
      onMouseEnter={!isMobile ? () => onEnter(index) : undefined}
      onMouseLeave={!isMobile ? onLeave : undefined}
      onFocus={!isMobile ? () => onEnter(index) : undefined}
      onBlur={!isMobile ? onLeave : undefined}
      onMouseMove={handleMouseMove}
      onClick={isMobile ? () => onToggle(index) : undefined}
      tabIndex={0}
      style={staticWidth ? { width: staticWidth } : undefined}
    >
      {/* Halo/wireframe/graph/matrix — visuel abstrait révélé au hover, en mouvement continu */}
      <ServicePanelVisual type={service.visual} offset={offset} active={isActive} />

      {/* Bordure lumineuse réactive au curseur */}
      <span className="glow-border" aria-hidden="true" />

      {/* Numéro géant en filigrane — respire et se décale à l'activation */}
      <motion.span
        className="pointer-events-none absolute -right-2 -top-6 select-none font-mono text-[7rem] font-black leading-none text-titanium/[0.06] md:text-[9rem]"
        aria-hidden="true"
        animate={{
          scale: isActive ? 1.12 : 1,
          opacity: isActive ? 0.13 : 0.06,
          x: isActive ? -14 : 0,
        }}
        transition={NUMBER_SPRING}
      >
        {num}
      </motion.span>

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <motion.div
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-titanium/10 bg-titanium/[0.04] backdrop-blur-md"
          animate={{ rotate: isActive ? 360 : 0, scale: isActive ? 1.08 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon className="h-6 w-6 text-accent-400" strokeWidth={1.5} />
        </motion.div>
        <motion.span
          animate={{ scale: isActive ? 1.06 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-400/90"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-300 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-300" />
          </span>
          [ {service.status[lang]} ]
        </motion.span>
      </div>

      {/* Titre — toujours visible */}
      <h3 className="relative z-10 font-grotesk text-2xl font-extrabold leading-tight tracking-tight text-titanium md:text-[1.7rem]">
        {num}. {content.title}
      </h3>

      {/* Corps révélé à l'expansion — cascade en stagger */}
      <motion.div
        variants={contentVariants}
        initial="closed"
        animate={isActive ? 'open' : 'closed'}
        style={{ height: isActive ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <motion.p variants={itemVariants} className="relative z-10 mb-6 mt-4 max-w-md text-sm leading-relaxed text-titanium/55">
          {content.desc}
        </motion.p>

        <div className="relative z-10 mb-8 flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <motion.span
              key={tag}
              variants={itemVariants}
              whileHover={{ scale: 1.06 }}
              className="rounded-full border border-titanium/10 bg-titanium/[0.03] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-titanium/60 backdrop-blur-md transition-colors duration-300 hover:border-accent-400/40 hover:text-accent-100 hover:shadow-[0_0_16px_rgba(251,146,60,0.2)]"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <motion.div variants={itemVariants}>
          <MagneticCTA
            label={lang === 'fr' ? 'Lancer le projet' : 'Start the project'}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Services — Accordéon Spatial Interactif : 3 piliers d'offre en panneaux
 * kinétiques 3.5D (desktop) / accordéon vertical (mobile).
 */
export default function Services({ visible }) {
  const { lang } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(null)
  const [mobileActive, setMobileActive] = useState(null)
  const reduceMotion = useReducedMotion()

  const handleToggleMobile = useCallback((i) => {
    setMobileActive((cur) => (cur === i ? null : i))
  }, [])

  return (
    <section className="relative px-6 py-32 md:px-16" id="services">
      <motion.div
        initial={visible ? { opacity: 0, y: 30 } : false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-16 flex items-end justify-between"
      >
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.5em] text-accent-400/70">
            {lang === 'fr' ? 'Ce que je propose' : 'What I offer'}
          </p>
          <h2 className="font-grotesk text-[clamp(36px,7vw,88px)] font-black leading-none tracking-tight text-titanium">
            SERVICES
          </h2>
        </div>
        <span className="hidden font-mono text-xs text-titanium/30 md:block">
          03 — {lang === 'fr' ? 'Offres' : 'Offers'}
        </span>
      </motion.div>

      {/* Desktop : panneaux kinétiques 3.5D */}
      <div className="hidden gap-4 md:flex" style={{ perspective: 1800 }}>
        {SERVICES.map((service, i) => (
          <Panel
            key={service.icon}
            service={service}
            index={i}
            activeIndex={activeIndex}
            onEnter={setActiveIndex}
            onLeave={() => setActiveIndex(null)}
            lang={lang}
            isMobile={false}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* Mobile : accordéon vertical */}
      <div className="flex flex-col gap-4 md:hidden">
        {SERVICES.map((service, i) => (
          <Panel
            key={service.icon}
            service={service}
            index={i}
            activeIndex={mobileActive}
            onToggle={handleToggleMobile}
            lang={lang}
            isMobile
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  )
}
