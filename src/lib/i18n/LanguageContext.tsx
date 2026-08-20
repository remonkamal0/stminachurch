'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import ar from './ar.json'
import en from './en.json'

type Locale = 'ar' | 'en'

interface LanguageContextProps {
  locale: Locale
  toggleLocale: () => void
  t: (key: string) => string
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

const translations: Record<Locale, any> = { ar, en }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ar')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale === 'ar' || savedLocale === 'en') {
      setLocale(savedLocale)
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    localStorage.setItem('locale', locale)
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }, [locale, isMounted])

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'ar' ? 'en' : 'ar'))
  }

  const t = (path: string): string => {
    const keys = path.split('.')
    let result: any = translations[locale]

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key]
      } else {
        // Fallback to English if key doesn't exist in current language
        let enFallback: any = translations['en']
        for (const k of keys) {
          enFallback = enFallback ? enFallback[k] : undefined
        }
        return enFallback || path
      }
    }

    return typeof result === 'string' ? result : path
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
