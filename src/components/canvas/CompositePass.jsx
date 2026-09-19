import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { compositeVertexShader, compositeFragmentShader } from '../shaders/composite'

/**
 * CompositePass — passe fullscreen finale.
 * Rend la scène dans une texture puis applique : loupe optique (bulge x1.4
 * + split RGB), ondes de choc au clic (2 slots recyclés) et heat haze.
 *
 * clickQueue : ref mutable [{x, y, time}] en coordonnées NDC.
 */
export default function CompositePass({ mouse, clickQueue, fireAnchor = [0.5, 0.28], fireVisibleRef }) {
  const { gl, scene, camera, size } = useThree()
  const shockSlot = useRef(0)
  const elapsedRef = useRef(0)

  const [compScene, compCamera, renderTarget] = useMemo(() => {
    const s = new THREE.Scene()
    const c = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const rt = new THREE.WebGLRenderTarget(
      Math.floor(size.width * gl.getPixelRatio()),
      Math.floor(size.height * gl.getPixelRatio()),
      { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat }
    )
    return [s, c, rt]
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uniforms = useMemo(
    () => ({
      uScene: { value: renderTarget.texture },
      uTime: { value: 0 },
      uAspect: { value: size.width / size.height },
      uLensCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uLensRadius: { value: 0.17 },
      uZoom: { value: 1.4 },
      uShockA: { value: new THREE.Vector4(0, 0, -10, 0) },
      uShockB: { value: new THREE.Vector4(0, 0, -10, 0) },
      uFireVisibility: { value: 0 },
      uFireAnchor: { value: new THREE.Vector2(...fireAnchor) },
    }),
    [renderTarget, size, fireAnchor] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const quad = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
      vertexShader: compositeVertexShader,
      fragmentShader: compositeFragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.frustumCulled = false
    return mesh
  }, [uniforms])

  useMemo(() => compScene.add(quad), [compScene, quad])

  useEffect(() => {
    return () => {
      renderTarget.dispose()
      quad.geometry.dispose()
      quad.material.dispose()
      compScene.remove(quad)
    }
  }, [renderTarget, quad, compScene])

  useFrame((state) => {
    const u = uniforms
    elapsedRef.current = state.clock.elapsedTime
    u.uTime.value = state.clock.elapsedTime

    const dpr = state.viewport.dpr
    const w = Math.floor(state.size.width * dpr)
    const h = Math.floor(state.size.height * dpr)
    if (renderTarget.width !== w || renderTarget.height !== h) {
      renderTarget.setSize(w, h)
    }
    u.uAspect.value = state.size.width / state.size.height

    // Loupe : NDC (-1..1) → UV (0..1)
    u.uLensCenter.value.set((mouse.current.x + 1) / 2, (mouse.current.y + 1) / 2)

    // Consomme les clics → déclenche une onde (NDC → UV)
    while (clickQueue.current.length > 0) {
      const click = clickQueue.current.shift()
      const slot = shockSlot.current % 2 === 0 ? u.uShockA : u.uShockB
      slot.value.set((click.x + 1) / 2, (click.y + 1) / 2, state.clock.elapsedTime, 1)
      shockSlot.current++
    }

    // Heat haze suit la visibilité du feu
    if (fireVisibleRef) {
      u.uFireVisibility.value += (fireVisibleRef.current - u.uFireVisibility.value) * 0.06
    }

    // Passe 1 : scène → texture
    gl.setRenderTarget(renderTarget)
    gl.render(scene, camera)
    // Passe 2 : composite → écran
    gl.setRenderTarget(null)
    gl.render(compScene, compCamera)
  }, 1)

  return null
}
