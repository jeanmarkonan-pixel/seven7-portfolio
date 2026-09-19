import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blackHoleVertexShader, blackHoleFragmentShader } from '../shaders/singularity'

/**
 * BlackHole — singularité gravitationnelle (Zone 3 : Footer/CTA).
 * Disque d'accrétion à rotation différentielle + photon sphere.
 */
export default function BlackHole({ visibleRef }) {
  const materialRef = useRef()
  const meshRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uIntensity.value += (visibleRef.current - u.uIntensity.value) * 0.05
    // Pulsation gravitationnelle lente
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03
      meshRef.current.scale.setScalar(s * 11)
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={blackHoleVertexShader}
        fragmentShader={blackHoleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
