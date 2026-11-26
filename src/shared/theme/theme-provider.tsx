import { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './theme-context'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'incidents.theme:v1',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : defaultTheme
    } catch {
      return defaultTheme
    }
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme !== 'system') {
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
      return
    }
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(query.matches ? 'dark' : 'light')
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [theme])
  // Printouts (incident "Save as PDF") always use the light palette.
  useEffect(() => {
    const root = document.documentElement
    let wasDark = false
    const toLight = () => {
      wasDark = root.classList.contains('dark')
      if (wasDark) root.classList.replace('dark', 'light')
    }
    const restore = () => {
      if (wasDark) root.classList.replace('light', 'dark')
    }
    window.addEventListener('beforeprint', toLight)
    window.addEventListener('afterprint', restore)
    return () => {
      window.removeEventListener('beforeprint', toLight)
      window.removeEventListener('afterprint', restore)
    }
  }, [])
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (next) => {
          try {
            localStorage.setItem(storageKey, next)
          } catch {
            /* Keep theme switching usable when storage is unavailable. */
          }
          setTheme(next)
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
