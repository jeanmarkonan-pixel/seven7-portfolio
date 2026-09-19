import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sparkVertexShader, sparkFragmentShader } from '../shaders/singularity'

const MAX_SPARKS = 400
const BURST_MIN = 30
const BURST_MAX = 50

/**
 * SparkBurst — pool de micro-particules pour le « clic magique ».
 * Chaque clic émet 30-50 étincelles avec vélocité, friction et gravité (GPU).
 * clickQueue : ref mutable rempli par le listener global (coord NDC + timestamp).
 */
export default function SparkBurst({ clickQueue, cameraZ = 6 }) {
  const materialRef = useRef()
  const geometryRef = useRef()
  const cursorRef = useRef(0)
  const { viewport } = useThree()

  const { positions, velocities, origins, births, sizes } = useMemo(() => ({
    positions: new Float32Array(MAX_SPARKS * 3),
    velocities: new Float32Array(MAX_SPARKS * 3),
    origins: new Float32Array(MAX_SPARKS * 3),
    births: new Float32Array(MAX_SPARKS).fill(-10),
    sizes: new Float32Array(MAX_SPARKS),
  }), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  )

  useFrame((state) => {
    if (!materialRef.current || !geometryRef.current) return
    uniforms.uTime.value = state.clock.elapsedTime

    // Lit les clics SANS vider la file (CompositePass la consomme pour les ondes)
    for (const click of clickQueue.current) {
      if (click.sparked) continue
      click.sparked = true

      // NDC → coordonnées monde au plan z=0
      const vp = viewport.getCurrentViewport()
      const wx = (click.x * 0.5) * vp.width
      const wy = (click.y * 0.5) * vp.height

      const count = BURST_MIN + Math.floor(Math.random() * (BURST_MAX - BURST_MIN))
      for (let i = 0; i < count; i++) {
        const idx = cursorRef.current % MAX_SPARKS
        cursorRef.current++

        const angle = Math.random() * Math.PI * 2
        const speed = 1.2 + Math.random() * 3.4
        const up = 0.6 + Math.random() * 1.8

        origins[idx * 3 + 0] = wx
        origins[idx * 3 + 1] = wy
        origins[idx * 3 + 2] = 0
        velocities[idx * 3 + 0] = Math.cos(angle) * speed
        velocities[idx * 3 + 1] = Math.sin(angle) * speed * 0.6 + up
        velocities[idx * 3 + 2] = (Math.random() - 0.5) * 1.2
        births[idx] = click.time
        sizes[idx] = 0.35 + Math.random() * 0.9
      }
    }

    if (clickQueue.current.some((c) => c.sparked)) {
      geometryRef.current.attributes.aOrigin.needsUpdate = true
      geometryRef.current.attributes.aVelocity.needsUpdate = true
      geometryRef.current.attributes.aBirth.needsUpdate = true
      geometryRef.current.attributes.aSize.needsUpdate = true
    }
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" count={MAX_SPARKS} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aVelocity" count={MAX_SPARKS} array={velocities} itemSize={3} />
        <bufferAttribute attach="attributes-aOrigin" count={MAX_SPARKS} array={origins} itemSize={3} />
        <bufferAttribute attach="attributes-aBirth" count={MAX_SPARKS} array={births} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={MAX_SPARKS} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={sparkVertexShader}
        fragmentShader={sparkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
