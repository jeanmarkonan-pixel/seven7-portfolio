import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { prismVertexShader, prismFragmentShader } from '../shaders/singularity'

/**
 * PrismCore — singularité prismatique du footer (Zone 3).
 * Vortex de verre irisé : anneaux concentriques + cœur lentille sombre.
 */
export default function PrismCore({ visibleRef }) {
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
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03
      meshRef.current.scale.setScalar(s * 11)
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.04
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={prismVertexShader}
        fragmentShader={prismFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
