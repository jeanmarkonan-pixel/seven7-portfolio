import { useMemo, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { liquidVertexShader, liquidFragmentShader, generateProjectTexture } from '../shaders/liquid'
import { ArrowUpRight } from 'lucide-react'

function LiquidPlane({ texture, hoverState, mouseUv }) {
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uIntensity: { value: 0 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [texture]
  )

  useFrame((state) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uMouse.value.copy(mouseUv.current)
  })

  // Transition douce de l'intensité via GSAP
  useEffect(() => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms.uIntensity
    const tween = gsap.to(u, {
      value: hoverState.current ? 1 : 0,
      duration: hoverState.current ? 0.7 : 1.0,
      ease: 'power3.out',
    })
    return () => tween.kill()
  })

  return (
    <mesh>
      <planeGeometry args={[4, 2.5, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

/**
 * ProjectCard — visuel WebGL avec distorsion liquide au survol + tilt 3D.
 * Chaque carte possède son propre petit canvas (ratio 4/2.5).
 */
export default function ProjectCard({ project, index }) {
  const hoverState = useRef(false)
  const mouseUv = useRef(new THREE.Vector2(0.5, 0.5))
  const cardRef = useRef(null)

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(generateProjectTexture(project.variant))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [project.variant])

  useEffect(() => () => texture.dispose(), [texture])

  const onEnter = useCallback(() => {
    hoverState.current = true
  }, [])
  const onLeave = useCallback(() => {
    hoverState.current = false
    mouseUv.current.set(0.5, 0.5)
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' })
  }, [])

  const onMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    mouseUv.current.set(px, 1 - py)
    gsap.to(cardRef.current, {
      rotateY: (px - 0.5) * 10,
      rotateX: (0.5 - py) * 8,
      duration: 0.6,
      ease: 'power2.out',
    })
  }, [])

  return (
    <article
      ref={cardRef}
      className="project-card group relative w-[82vw] max-w-[720px] flex-shrink-0 will-change-transform md:w-[58vw]"
      style={{ transformStyle: 'preserve-3d', perspective: '900px' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      data-cursor-label="Voir"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-abyss">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 2.55], fov: 45 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <LiquidPlane texture={texture} hoverState={hoverState} mouseUv={mouseUv} />
        </Canvas>

        {/* Voile + reflet verre */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/80 via-transparent to-white/[0.04]" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(600px circle at 50% 0%, rgba(103,232,249,0.08), transparent 60%)' }}
        />
      </div>

      {/* Méta projet */}
      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[10px] text-cyan-200/60">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/40">
              {project.category}
            </span>
          </div>
          <h3 className="font-grotesk text-2xl font-extrabold tracking-tight text-titanium md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-md font-serif text-sm italic leading-relaxed text-titanium/50">
            {project.description}
          </p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-titanium/60 transition-all duration-300 group-hover:border-cyan-200/50 group-hover:text-cyan-200">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
    </article>
  )
}
