import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const LanguageContext = createContext({ lang: 'fr', toggleLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('fr')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'fr' ? 'en' : 'fr'))
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
