import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../../src/shared/theme/theme-provider'
import { useTheme } from '../../../src/shared/theme/theme-context'

function SwitchTheme() {
  const { setTheme } = useTheme()
  return <button onClick={() => setTheme('dark')}>Dark</button>
}
afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('tracks system preference changes and removes its listener when the theme changes', () => {
  let listener!: () => void
  const query = {
    matches: false,
    addEventListener: vi.fn((_event: string, callback: () => void) => {
      listener = callback
    }),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => query),
  )
  render(
    <ThemeProvider>
      <SwitchTheme />
    </ThemeProvider>,
  )
  expect(document.documentElement.classList.contains('light')).toBe(true)
  act(() => {
    query.matches = true
    listener()
  })
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
  expect(localStorage.getItem('incidents.theme:v1')).toBe('dark')
  expect(query.removeEventListener).toHaveBeenCalledWith('change', listener)
})
it('uses the default for an invalid stored theme and keeps switching usable without storage', () => {
  localStorage.setItem('incidents.theme:v1', 'unknown')
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Unavailable')
  })
  render(
    <ThemeProvider defaultTheme="light">
      <SwitchTheme />
    </ThemeProvider>,
  )
  expect(document.documentElement.classList.contains('light')).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

it('prints with the light palette and restores dark afterwards', () => {
  localStorage.setItem('incidents.theme:v1', 'dark')
  render(
    <ThemeProvider>
      <p>Content</p>
    </ThemeProvider>,
  )
  const root = document.documentElement
  expect(root.classList.contains('dark')).toBe(true)
  act(() => {
    window.dispatchEvent(new Event('beforeprint'))
  })
  expect(root.classList.contains('light')).toBe(true)
  act(() => {
    window.dispatchEvent(new Event('afterprint'))
  })
  expect(root.classList.contains('dark')).toBe(true)
})
