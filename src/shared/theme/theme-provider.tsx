import { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './theme-context'

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
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
