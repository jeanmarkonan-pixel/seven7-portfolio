import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { lensVertexShader, lensFragmentShader } from '../shaders/lens'

/**
 * Lens — loupe optique plein écran.
 * Principe : la scène est rendue dans une texture (render target),
 * puis un quad fullscreen la ré-échantillonne avec réfraction sphérique
 * + aberration chromatique sous le curseur.
 *
 * Intégration : placer <Lens mouse={mouse}> APRÈS le contenu de la scène
 * dans le Canvas, avec priority de rendu = 1 (prend le relais du rendu par défaut).
 */
export default function Lens({ mouse, zoom = 1.6, radius = 0.16 }) {
  const { gl, scene, camera, size } = useThree()
  const materialRef = useRef()

  // Scène offscreen + caméra ortho pour le quad fullscreen
  const [lensScene, lensCamera, renderTarget] = useMemo(() => {
    const s = new THREE.Scene()
    const c = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const rt = new THREE.WebGLRenderTarget(
      size.width * gl.getPixelRatio(),
      size.height * gl.getPixelRatio(),
      { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }
    )
    return [s, c, rt]
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uniforms = useMemo(
    () => ({
      uScene: { value: renderTarget.texture },
      uLensCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uLensRadius: { value: radius },
      uZoom: { value: zoom },
      uAspect: { value: size.width / size.height },
      uActive: { value: 1 },
    }),
    [renderTarget, radius, zoom] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const quad = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
      vertexShader: lensVertexShader,
      fragmentShader: lensFragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })
    materialRef.current = mat
    const mesh = new THREE.Mesh(geo, mat)
    mesh.frustumCulled = false
    return mesh
  }, [uniforms])

  useMemo(() => lensScene.add(quad), [lensScene, quad])

  // Libération des ressources GPU au démontage
  useEffect(() => {
    return () => {
      renderTarget.dispose()
      quad.geometry.dispose()
      quad.material.dispose()
      lensScene.remove(quad)
    }
  }, [renderTarget, quad, lensScene])

  useFrame((state) => {
    const u = uniforms
    const dpr = state.viewport.dpr
    const w = Math.floor(state.size.width * dpr)
    const h = Math.floor(state.size.height * dpr)
    if (renderTarget.width !== w || renderTarget.height !== h) {
      renderTarget.setSize(w, h)
    }
    u.uAspect.value = state.size.width / state.size.height

    // Position souris : NDC (-1..1) → UV (0..1)
    u.uLensCenter.value.set(
      (mouse.current.x + 1) / 2,
      (mouse.current.y + 1) / 2
    )

    // Passe 1 : scène → texture
    gl.setRenderTarget(renderTarget)
    gl.render(scene, camera)

    // Passe 2 : quad avec loupe → écran
    gl.setRenderTarget(null)
    gl.render(lensScene, lensCamera)
  }, 1) // priority 1 : prend le relais du rendu par défaut

  return null
}
