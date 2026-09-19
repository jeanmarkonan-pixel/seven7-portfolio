import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'seven7-season-override'
export const SEASONS = ['winter', 'spring', 'summer', 'autumn']

/** Saison météorologique réelle selon le mois courant (calendrier hémisphère nord). */
function seasonFromDate(date = new Date()) {
  const month = date.getMonth() // 0-11
  if (month === 11 || month <= 1) return 'winter'
  if (month <= 4) return 'spring'
  if (month <= 7) return 'summer'
  return 'autumn'
}

function readOverride() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return SEASONS.includes(v) ? v : null
  } catch {
    return null
  }
}

const SeasonContext = createContext({
  season: 'winter',
  isAuto: true,
  setSeason: () => {},
  resetToAuto: () => {},
})

export function SeasonProvider({ children }) {
  const [override, setOverride] = useState(readOverride)
  const auto = useMemo(() => seasonFromDate(), [])

  const setSeason = useCallback((s) => {
    if (!SEASONS.includes(s)) return
    setOverride(s)
    try {
      localStorage.setItem(STORAGE_KEY, s)
    } catch {
      /* stockage indisponible (navigation privée…) : la session garde le choix en mémoire */
    }
  }, [])

  const resetToAuto = useCallback(() => {
    setOverride(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* idem */
    }
  }, [])

  const value = useMemo(
    () => ({
      season: override || auto,
      isAuto: !override,
      setSeason,
      resetToAuto,
    }),
    [override, auto, setSeason, resetToAuto]
  )

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}

export function useSeason() {
  return useContext(SeasonContext)
}
