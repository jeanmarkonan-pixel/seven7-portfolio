import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import SkillOrbit from './SkillOrbit'

/**
 * LabScene — Canvas dédié à la section Lab (tore de verre + orbite de skills).
 * Instance WebGL séparée, montée uniquement quand la section est visible.
 */
export default function LabScene({ mouse }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[4, 4, 4]} intensity={12} color="#67E8F9" />
      <pointLight position={[-4, -3, 3]} intensity={8} color="#7C3AED" />
      <SkillOrbit mouse={mouse} />
      {/* Lumière d'environnement procédurale (aucun HDR externe requis) */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[0, 3, 2]} scale={[6, 2, 1]} color="#67E8F9" />
        <Lightformer intensity={1.4} position={[-3, -2, 1]} scale={[4, 3, 1]} color="#7C3AED" />
        <Lightformer intensity={1} position={[3, 0, -3]} scale={[3, 5, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  )
}
