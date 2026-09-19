import { useMemo, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { liquidVertexShader, liquidFragmentShader, generateProjectTexture } from '../shaders/liquid'
import { ArrowUpRight } from 'lucide-react'

function LiquidPlane({ texture, hoverState, mouseUv }) {
  const materialRef = useRef()
  const hoverRef = useRef(false)

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
    // Transition d'intensité à chaque changement d'état de survol
    if (hoverRef.current !== hoverState.current) {
      hoverRef.current = hoverState.current
      gsap.to(u.uIntensity, {
        value: hoverRef.current ? 1 : 0,
        duration: hoverRef.current ? 0.7 : 1.0,
        ease: 'power3.out',
      })
    }
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
 * Utilise la vraie capture du projet (image) quand disponible,
 * sinon un visuel procédural à la palette signature.
 * Cliquable si le projet a une URL.
 */
export default function ProjectCard({ project, index, lang }) {
  const hoverState = useRef(false)
  const mouseUv = useRef(new THREE.Vector2(0.5, 0.5))
  const cardRef = useRef(null)

  const texture = useMemo(() => {
    let tex
    if (project.image) {
      tex = new THREE.TextureLoader().load(project.image)
      tex.crossOrigin = 'anonymous'
    } else {
      tex = new THREE.CanvasTexture(generateProjectTexture(project.variant))
    }
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    return tex
  }, [project.variant, project.image])

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

  const onClick = useCallback(() => {
    if (project.url) window.open(project.url, '_blank', 'noopener,noreferrer')
  }, [project.url])

  const isLive = project.status === 'live'
  const statusLabel = isLive
    ? (lang === 'fr' ? 'En ligne' : 'Live')
    : (lang === 'fr' ? 'En développement' : 'In development')

  return (
    <article
      ref={cardRef}
      className={`project-card group relative w-[82vw] max-w-[720px] flex-shrink-0 will-change-transform md:w-[58vw] ${project.url ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ transformStyle: 'preserve-3d', perspective: '900px' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      onClick={onClick}
      data-cursor-label={project.url ? (lang === 'fr' ? 'Voir' : 'View') : undefined}
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

        {/* Badge statut */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-abyss/60 px-3 py-1.5 backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-titanium/80">{statusLabel}</span>
        </div>
      </div>

      {/* Méta projet */}
      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-[10px] text-cyan-200/60">
              {String(index + 1).padStart(2, '0')}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-titanium/50">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-grotesk text-2xl font-extrabold tracking-tight text-titanium md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-md font-serif text-sm italic leading-relaxed text-titanium/50">
            {project.desc[lang]}
          </p>
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${project.url ? 'border-white/15 text-titanium/60 group-hover:border-cyan-200/50 group-hover:text-cyan-200' : 'border-white/5 text-titanium/20'}`}>
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
    </article>
  )
}
