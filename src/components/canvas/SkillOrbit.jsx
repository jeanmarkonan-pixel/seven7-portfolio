import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { orbitVertexShader, orbitFragmentShader } from '../shaders/orbit'

/**
 * SkillOrbit — anneau de pastilles de verre en apesanteur autour d'un tore.
 * Physique (orbite, flottement, rafale de vent) 100% GPU via instancing.
 */
export default function SkillOrbit({ mouse, count = 42 }) {
  const meshRef = useRef()
  const materialRef = useRef()
  const torusRef = useRef()

  const { centers, phases, speeds, tilts } = useMemo(() => {
    const centers = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const speeds = new Float32Array(count)
    const tilts = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.random() * 1.3 // rayon orbital
      const theta = Math.random() * Math.PI * 2
      centers[i * 3 + 0] = Math.cos(theta) * r
      centers[i * 3 + 1] = (Math.random() - 0.5) * 1.6
      centers[i * 3 + 2] = Math.sin(theta) * r
      phases[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.05 + Math.random() * 0.12
      tilts[i] = (Math.random() - 0.5) * 0.7
    }
    return { centers, phases, speeds, tilts }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSpeed: { value: 0 },
      uColor: { value: new THREE.Color('#67E8F9') },
    }),
    []
  )

  useFrame((state, delta) => {
    if (materialRef.current) {
      const u = materialRef.current.uniforms
      u.uTime.value = state.clock.elapsedTime
      u.uMouse.value.set(mouse.current.x, mouse.current.y)
      u.uSpeed.value = mouse.current.speed
    }
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.08
      torusRef.current.rotation.y += delta * 0.12
    }
  })

  return (
    <group>
      {/* Tore de verre dépoli central */}
      <mesh ref={torusRef}>
        <torusGeometry args={[1.15, 0.42, 48, 96]} />
        <meshPhysicalMaterial
          color="#0e1418"
          roughness={0.18}
          metalness={0.1}
          transmission={0.92}
          thickness={1.2}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.15}
          envMapIntensity={1.4}
          transparent
        />
      </mesh>

      {/* Noyau lumineux */}
      <mesh>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshBasicMaterial color="#67E8F9" transparent opacity={0.55} />
      </mesh>

      {/* Pastilles de compétences instanciées */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.34, 0.34]}>
          <instancedBufferAttribute attach="attributes-aCenter" args={[centers, 3]} />
          <instancedBufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
          <instancedBufferAttribute attach="attributes-aOrbitSpeed" args={[speeds, 1]} />
          <instancedBufferAttribute attach="attributes-aTilt" args={[tilts, 1]} />
        </planeGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={orbitVertexShader}
          fragmentShader={orbitFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}
