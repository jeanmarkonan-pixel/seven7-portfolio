import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fireVertexShader, fireFragmentShader, emberVertexShader, emberFragmentShader } from '../shaders/fire'

/**
 * FirePlane — plan de flammes procédurales FBM (Zone 2 : Solar Core).
 * visibleRef.current ∈ [0..1] pilote l'intensité (fondu au scroll).
 */
export function FirePlane({ visibleRef, mouse }) {
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  useFrame((state) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uMouse.value.set(mouse.current.x, mouse.current.y)
    // Lerp doux vers la visibilité cible
    u.uIntensity.value += (visibleRef.current - u.uIntensity.value) * 0.06
  })

  return (
    <mesh position={[0, -1.2, 0]} scale={[16, 9, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fireVertexShader}
        fragmentShader={fireFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/**
 * EmberField — 900 braises instanciées GPU : ascension, turbulence,
 * scintillement et dissipation d'opacité. Zéro calcul CPU par particule.
 */
export function EmberField({ visibleRef, count = 900 }) {
  const materialRef = useRef()

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = -4 + Math.random() * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
      seeds[i * 3 + 0] = Math.random()                    // phase
      seeds[i * 3 + 1] = 0.5 + Math.random() * 1.1        // vitesse
      seeds[i * 3 + 2] = 0.5 + Math.random() * 1.6        // taille
    }
    return { positions, seeds }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    }),
    []
  )

  useFrame((state) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uIntensity.value += (visibleRef.current - u.uIntensity.value) * 0.06
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSeed" count={count} array={seeds} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={emberVertexShader}
        fragmentShader={emberFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
