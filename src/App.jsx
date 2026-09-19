import { useState, useCallback, lazy, Suspense } from 'react'
import Preloader from './components/ui/Preloader'
import Cursor from './components/ui/Cursor'
import Nav from './components/ui/Nav'
import Hero from './components/sections/Hero'
import Services from './components/sections/Services'
import Showcase from './components/sections/Showcase'
import Lab from './components/sections/Lab'
import MagneticFooter from './components/sections/MagneticFooter'
import { useLenis } from './hooks/useLenis'
import { useMouse } from './hooks/useMouse'
import { LanguageProvider, useLanguage } from './hooks/useLanguage'
import { SeasonProvider } from './hooks/useSeason'
import SeasonOverlay from './components/ui/SeasonOverlay'
import SeasonSwitcher from './components/ui/SeasonSwitcher'

// Code-splitting : la scène WebGL (Three.js) est chargée en chunk séparé
const HeroScene = lazy(() => import('./components/canvas/HeroScene'))

function Shell() {
  const [loaded, setLoaded] = useState(false)
  const mouse = useMouse()
  const { scrollTo } = useLenis()
  const { lang, toggleLang } = useLanguage()

  const handlePreloaderComplete = useCallback(() => setLoaded(true), [])

  return (
    <>
      {/* Grain cinématographique global */}
      <div className="film-grain" aria-hidden="true" />

      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}
      <Nav visible={loaded} scrollTo={scrollTo} lang={lang} toggleLang={toggleLang} />
      <Cursor />

      {/* Ambiance saisonnière : pluie de particules + sélecteur flottant */}
      <SeasonOverlay enabled={loaded} />
      <SeasonSwitcher visible={loaded} />

      {/* Scène 3D en fond fixe (chargée après le shell) + loupe optique */}
      <Suspense fallback={null}>
        <HeroScene mouse={mouse} lens />
      </Suspense>

      <main className="relative">
        <Hero visible={loaded} />
        <Services visible={loaded} />
        <Showcase />
        <Lab visible={loaded} />
        <MagneticFooter />
      </main>
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <SeasonProvider>
        <Shell />
      </SeasonProvider>
    </LanguageProvider>
  )
}
