import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import WindField from './WindField'
import Lens from './Lens'

/**
 * HeroScene — Canvas WebGL plein écran en fond du Hero.
 * Post-processing : Bloom subtil + aberration chromatique + vignettage.
 * La loupe optique (render-to-texture + réfraction) est optionnelle via prop.
 */
export default function HeroScene({ mouse, lens = false }) {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <WindField mouse={mouse} />
        {lens ? (
          <Lens mouse={mouse} zoom={1.7} radius={0.17} />
        ) : (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.55} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur />
            <ChromaticAberration offset={[0.0006, 0.0009]} />
            <Vignette eskil={false} offset={0.22} darkness={0.78} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
