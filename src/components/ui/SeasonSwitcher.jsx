import { Snowflake, Flower2, Sun, Leaf } from 'lucide-react'
import { useSeason } from '../../hooks/useSeason'
import { useLanguage } from '../../hooks/useLanguage'

const OPTIONS = [
  { key: 'winter', icon: Snowflake, fr: 'Hiver', en: 'Winter', ring: 'text-sky-300 border-sky-300/50 shadow-[0_0_14px_rgba(125,211,252,0.35)]' },
  { key: 'spring', icon: Flower2, fr: 'Printemps', en: 'Spring', ring: 'text-pink-300 border-pink-300/50 shadow-[0_0_14px_rgba(249,168,212,0.35)]' },
  { key: 'summer', icon: Sun, fr: 'Été', en: 'Summer', ring: 'text-amber-300 border-amber-300/50 shadow-[0_0_14px_rgba(252,211,77,0.35)]' },
  { key: 'autumn', icon: Leaf, fr: 'Automne', en: 'Autumn', ring: 'text-orange-400 border-orange-400/50 shadow-[0_0_14px_rgba(251,146,60,0.35)]' },
]

/**
 * SeasonSwitcher — pastille flottante permettant de forcer une saison
 * (sinon détectée automatiquement selon la date). Recliquer la saison
 * déjà active repasse en mode automatique.
 */
export default function SeasonSwitcher({ visible }) {
  const { season, isAuto, setSeason, resetToAuto } = useSeason()
  const { lang } = useLanguage()

  const handleClick = (key) => {
    if (key === season && !isAuto) resetToAuto()
    else setSeason(key)
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[86] flex items-center gap-1 rounded-full border border-white/10 bg-abyss/70 p-1.5 backdrop-blur-md transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="group"
      aria-label={lang === 'fr' ? 'Choisir la saison' : 'Choose season'}
    >
      {OPTIONS.map(({ key, icon: Icon, fr, en, ring }) => {
        const active = season === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            data-cursor-label={lang === 'fr' ? fr : en}
            aria-label={lang === 'fr' ? fr : en}
            aria-pressed={active}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
              active ? `bg-white/[0.06] ${ring}` : 'border-transparent text-titanium/40 hover:text-titanium/70'
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )
      })}
      <span
        className={`ml-1 h-1.5 w-1.5 rounded-full transition-colors duration-500 ${isAuto ? 'bg-cyan-300 shadow-[0_0_6px_rgba(0,242,254,0.7)]' : 'bg-white/15'}`}
        title={isAuto ? (lang === 'fr' ? 'Saison automatique' : 'Automatic season') : (lang === 'fr' ? 'Saison forcée' : 'Season forced')}
      />
    </div>
  )
}
