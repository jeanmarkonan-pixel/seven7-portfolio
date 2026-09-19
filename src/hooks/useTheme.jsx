import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'seven7-theme'

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

/** Thème clair "tableau" par défaut, sombre disponible en bascule (persisté). */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored() || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* stockage indisponible : le choix reste en mémoire pour la session */
      }
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
