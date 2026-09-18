import { useState, useCallback, lazy, Suspense } from 'react'
import Preloader from './components/ui/Preloader'
import Cursor from './components/ui/Cursor'
import Nav from './components/ui/Nav'
import Hero from './components/sections/Hero'
import Showcase from './components/sections/Showcase'
import Lab from './components/sections/Lab'
import MagneticFooter from './components/sections/MagneticFooter'
import { useLenis } from './hooks/useLenis'
import { useMouse } from './hooks/useMouse'

// Code-splitting : la scène WebGL (Three.js) est chargée en chunk séparé
const HeroScene = lazy(() => import('./components/canvas/HeroScene'))

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const mouse = useMouse()
  const { scrollTo } = useLenis()

  const handlePreloaderComplete = useCallback(() => setLoaded(true), [])

  return (
    <>
      {/* Grain cinématographique global */}
      <div className="film-grain" aria-hidden="true" />

      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}
      <Nav visible={loaded} scrollTo={scrollTo} />
      <Cursor />

      {/* Scène 3D en fond fixe (chargée après le shell) + loupe optique */}
      <Suspense fallback={null}>
        <HeroScene mouse={mouse} lens />
      </Suspense>

      <main className="relative">
        <Hero visible={loaded} />
        <Showcase />
        <Lab visible={loaded} />
        <MagneticFooter />
      </main>
    </>
  )
}
