import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * SlicedPlanes — architecture spatiale découpée en 3 couches de profondeur.
 * Plans « tranchés » (bandes diagonales) à z = -50, -20, 0.
 * Parallaxe 3.5D : chaque couche dérive à une vitesse asynchrone extrême
 * selon scrollRef.current (progression 0..1 fournie par ScrollTrigger).
 */

function makeSliceGeometry(count, spreadY, thickness) {
  const geos = []
  for (let i = 0; i < count; i++) {
    const g = new THREE.PlaneGeometry(34, thickness * (0.6 + Math.random() * 0.8))
    const y = -spreadY / 2 + (i / (count - 1)) * spreadY
    const skew = (Math.random() - 0.5) * 1.6
    const m = new THREE.Matrix4()
      .makeRotationZ(skew * 0.12)
      .setPosition((Math.random() - 0.5) * 4, y, 0)
    g.applyMatrix4(m)
    geos.push(g)
  }
  return geos
}

function SliceLayer({ z, count, spreadY, thickness, color, opacity, speed, scrollRef, scrollSpan }) {
  const groupRef = useRef()
  const geometries = useMemo(() => makeSliceGeometry(count, spreadY, thickness), [count, spreadY, thickness])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    [color, opacity]
  )

  useFrame(() => {
    if (!groupRef.current) return
    // Parallaxe 3.5D : translation verticale asynchrone + légère rotation
    const p = scrollRef.current * scrollSpan
    groupRef.current.position.y = p * speed
    groupRef.current.rotation.z = scrollRef.current * speed * 0.02
  })

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={material} />
      ))}
    </group>
  )
}

export default function SlicedPlanes({ scrollRef, scrollSpan = 60 }) {
  return (
    <>
      {/* Couche profonde : nébuleuse lointaine, dérive rapide */}
      <SliceLayer z={-50} count={7} spreadY={scrollSpan * 1.4} thickness={3.2} color="#0b1d33" opacity={0.55} speed={2.6} scrollRef={scrollRef} scrollSpan={scrollSpan} />
      {/* Couche médiane : cristaux cyan */}
      <SliceLayer z={-20} count={9} spreadY={scrollSpan * 1.2} thickness={1.4} color="#164e63" opacity={0.4} speed={1.5} scrollRef={scrollRef} scrollSpan={scrollSpan} />
      {/* Couche frontale : lamelles titane proches */}
      <SliceLayer z={-4} count={11} spreadY={scrollSpan} thickness={0.35} color="#3f3f46" opacity={0.3} speed={0.7} scrollRef={scrollRef} scrollSpan={scrollSpan} />
    </>
  )
}
