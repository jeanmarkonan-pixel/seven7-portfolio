import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll Lenis global, synchronisé avec GSAP ScrollTrigger :
 * Lenis pilote le scroll natif et notifie ScrollTrigger à chaque frame,
 * ce qui garantit que les sections épinglées (pin) restent fluides.
 */
export function useLenis() {
  const lenisRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    let lenis = null
    let cancelled = false

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })
      lenisRef.current = lenis

      lenis.on('scroll', ScrollTrigger.update)

      const raf = (time) => {
        lenis.raf(time)
        rafRef.current = requestAnimationFrame(raf)
      }
      rafRef.current = requestAnimationFrame(raf)

      // Recalcule les triggers une fois les fonts chargées
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh())
      }
    })

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (lenis) lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback((target) => {
    lenisRef.current?.scrollTo(target, { offset: 0, duration: 1.6 })
  }, [])

  // Utilisés pour geler le scroll pendant une modale (étude de cas) sans
  // perdre la position, contrairement à un simple overflow:hidden sur le body.
  const stop = useCallback(() => lenisRef.current?.stop(), [])
  const start = useCallback(() => lenisRef.current?.start(), [])

  return { lenisRef, scrollTo, stop, start }
}
