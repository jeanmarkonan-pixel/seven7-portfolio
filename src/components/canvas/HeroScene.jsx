import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WindField from './WindField'
import SlicedPlanes from './SlicedPlanes'
import PrismCore from './PrismCore'
import SparkBurst from './SparkBurst'
import CompositePass from './CompositePass'

gsap.registerPlugin(ScrollTrigger)

// ── Courbes de visibilité des zones selon la progression du scroll (0..1) ──
// Zone 1 (Hero) : cristal / vent       → visible 0.00 → 0.30
// Zone 2 (Showcase) : solar core / feu → visible 0.25 → 0.65
// Zone 3 (Footer) : singularité        → visible 0.70 → 1.00
function zoneVisibility(p) {
  const lerp = (a, b, t) => a + (b - a) * t
  const smooth = (e0, e1, x) => {
    const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1)
    return t * t * (3 - 2 * t)
  }
  return {
    hero: 1 - smooth(0.18, 0.34, p),
    fire: smooth(0.24, 0.38, p) * (1 - smooth(0.60, 0.74, p)),
    hole: smooth(0.70, 0.85, p),
    // La caméra plonge de 0 à -60 en traversant les dimensions
    camY: lerp(0, -60, p),
  }
}

/** Pilote caméra : plongée verticale + secousse amortie au clic */
function CameraRig({ scrollRef, shakeRef }) {
  useFrame(({ camera }) => {
    const { camY } = zoneVisibility(scrollRef.current)
    camera.position.y += (camY - camera.position.y) * 0.08

    // Soundless Haptic Shake : décroissance ressort amortie
    if (shakeRef.current.energy > 0.001) {
      const s = shakeRef.current
      s.velocity += -s.offset * 0.22        // ressort
      s.velocity *= 0.82                     // amortissement
      s.offset += s.velocity
      s.energy = Math.abs(s.offset) + Math.abs(s.velocity)
      camera.position.x = s.offset * 0.012   // ≈ 5px d'amplitude initiale
      camera.rotation.z = s.offset * 0.0016
    } else {
      camera.position.x *= 0.8
      camera.rotation.z *= 0.8
    }
  })
  return null
}

/** Orchestre les visibilités de zones et pousse les refs à chaque frame */
function WorldOrchestrator({ scrollRef, heroVis, fireVis, holeVis }) {
  useFrame(() => {
    const v = zoneVisibility(scrollRef.current)
    heroVis.current = v.hero
    fireVis.current = v.fire
    holeVis.current = v.hole
  })
  return null
}

/**
 * HeroScene — Canvas WebGL global multi-dimensions :
 *  Cristal (vent/particules) → [Zone 2 en attente] → Singularité.
 * Post-traitement unique : loupe + shockwave + vignette.
 */
export default function HeroScene({ mouse }) {
  const scrollRef = useRef(0)
  const heroVis = useRef(1)
  const fireVis = useRef(0)
  const holeVis = useRef(0)
  const clickQueue = useRef([])
  const shakeRef = useRef({ offset: 0, velocity: 0, energy: 0 })

  // Progression du scroll global (Lenis ↔ ScrollTrigger déjà synchronisés)
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { scrollRef.current = self.progress },
    })
    return () => st.kill()
  }, [])

  // Clic magique : file d'impacts (sparks + onde de choc) + impulsion de shake
  useEffect(() => {
    const onClick = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      clickQueue.current.push({ x, y, time: performance.now() / 1000, sparked: false })
      if (clickQueue.current.length > 6) clickQueue.current.shift()
      // Impulsion du screen shake
      shakeRef.current.velocity += 3.4
      shakeRef.current.energy = 1
    }
    window.addEventListener('pointerdown', onClick, { passive: true })
    return () => window.removeEventListener('pointerdown', onClick)
  }, [])

  // Adapter le temps de clic (performance.now) au temps du shader (elapsedTime) :
  // les deux démarrent au chargement de la page, l'écart est négligeable.

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 120 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <CameraRig scrollRef={scrollRef} shakeRef={shakeRef} />
        <WorldOrchestrator scrollRef={scrollRef} heroVis={heroVis} fireVis={fireVis} holeVis={holeVis} />

        {/* Architecture spatiale tranchée : z -50 / -20 / 0, parallaxe 3.5D */}
        <SlicedPlanes scrollRef={scrollRef} scrollSpan={60} />

        {/* Zone 1 — Cristal : brume de particules réactive au vent */}
        <group visible={true}>
          <WindField mouse={mouse} visibleRef={heroVis} />
        </group>

        {/* Zone 2 — Solar Core : en attente (ancien FireWorld retiré, remplacement Monolith à venir) */}

        {/* Zone 3 — Singularité : trou noir prismatique au CTA */}
        <group position={[0, -58, -3]}>
          <PrismCore visibleRef={holeVis} />
        </group>

        {/* Clic magique : éclats de particules physiques */}
        <SparkBurst clickQueue={clickQueue} />

        {/* Passe finale : loupe + shockwave + vignette */}
        <CompositePass
          mouse={mouse}
          clickQueue={clickQueue}
        />
      </Canvas>
    </div>
  )
}
