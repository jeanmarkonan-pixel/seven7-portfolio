import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { particleVertexShader, particleFragmentShader } from '../shaders/particles'

const COUNT_DESKTOP = 26000
const COUNT_MOBILE = 9000

/**
 * WindField — nappe de particules GPU réactive à la vélocité de la souris.
 * Simule des rafales de vent : poussée directionnelle + tourbillon.
 */
export default function WindField({ mouse }) {
  const pointsRef = useRef()
  const materialRef = useRef()
  const { viewport } = useThree()

  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
    []
  )
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP

  const { positions, scales, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const randoms = new Float32Array(count * 3)
    const spreadX = 14
    const spreadY = 8
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
      scales[i] = Math.random() * 0.9 + 0.25
      randoms[i * 3 + 0] = Math.random()
      randoms[i * 3 + 1] = Math.random()
      randoms[i * 3 + 2] = Math.random()
    }
    return { positions, scales, randoms }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uSpeed: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uColorA: { value: new THREE.Color('#EDEDED') },
      uColorB: { value: new THREE.Color('#67E8F9') },
    }),
    []
  )

  useEffect(() => {
    const onResize = () => {
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [uniforms])

  useFrame((state) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uMouse.value.set(mouse.current.x, mouse.current.y)
    u.uVelocity.value.set(mouse.current.vx, -mouse.current.vy)
    u.uSpeed.value = mouse.current.speed
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={count} array={scales} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
