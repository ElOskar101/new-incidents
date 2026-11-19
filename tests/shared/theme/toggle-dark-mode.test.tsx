import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DarkModeToggle, ThemeProvider } from '../../../src/shared/theme'

afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
  vi.unstubAllGlobals()
})

function openMenu() {
  fireEvent.keyDown(screen.getByRole('button', { name: 'Change theme' }), { key: 'Enter' })
}

function choose(name: string) {
  openMenu()
  fireEvent.click(screen.getByRole('menuitemradio', { name }))
}

it('shows which theme is selected', () => {
  render(
    <ThemeProvider defaultTheme="light">
      <DarkModeToggle />
    </ThemeProvider>,
  )
  openMenu()
  expect(screen.getByRole('menuitemradio', { name: 'Light' }).getAttribute('aria-checked')).toBe(
    'true',
  )
  expect(screen.getByRole('menuitemradio', { name: 'Dark' }).getAttribute('aria-checked')).toBe(
    'false',
  )
})

it('switches and remembers the theme from the menu', () => {
  render(
    <ThemeProvider defaultTheme="light">
      <DarkModeToggle />
    </ThemeProvider>,
  )
  choose('Dark')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('vite-ui-theme')).toBe('dark')
  choose('Light')
  expect(document.documentElement.classList.contains('light')).toBe(true)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

it('follows the system preference when System is chosen', () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  render(
    <ThemeProvider defaultTheme="light">
      <DarkModeToggle />
    </ThemeProvider>,
  )
  choose('System')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
