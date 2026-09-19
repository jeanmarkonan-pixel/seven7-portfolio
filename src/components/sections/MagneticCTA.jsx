import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const SPRING = { stiffness: 300, damping: 20, mass: 0.4 }
const MAX_PULL = 14

/**
 * MagneticCTA — bouton qui se "colle" légèrement au curseur dans son
 * rayon d'action, avec flèche qui pivote vers le point d'entrée.
 */
export default function MagneticCTA({ label, onClick }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)
  const srotate = useSpring(rotate, SPRING)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(Math.max(Math.min(relX * 0.4, MAX_PULL), -MAX_PULL))
    y.set(Math.max(Math.min(relY * 0.4, MAX_PULL), -MAX_PULL))
    rotate.set((Math.atan2(relY, relX) * 180) / Math.PI + 45)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
    rotate.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className="group/cta relative mt-auto inline-flex w-fit items-center gap-2 overflow-hidden rounded-full border border-cyan-200/25 bg-white/[0.03] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-titanium/85 backdrop-blur-md transition-colors duration-300 hover:border-cyan-200/60 hover:text-white"
    >
      <span>{label}</span>
      <motion.span style={{ rotate: srotate }} className="inline-flex">
        <ArrowUpRight className="h-4 w-4 text-cyan-200" strokeWidth={2} />
      </motion.span>
      <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-cyan-300/0 via-cyan-300/10 to-cyan-300/0 opacity-0 transition-opacity duration-500 group-hover/cta:opacity-100" />
    </motion.button>
  )
}
