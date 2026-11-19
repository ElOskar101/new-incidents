import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AccountSummary } from '../../../src/features/auth'

import { clearAccountCache } from '../../../src/features/auth/services/load-account'
import { readStoredToken, saveAuthToken } from '../../../src/features/auth/services/session'

function loginReturnUrl(href: string): string {
  const login = new URL(href)
  const encoded = login.searchParams.get('url')
  if (login.origin !== 'https://auth.controlcentralcarrier.com' || !encoded) {
    throw new Error(`Expected a login redirect, received ${href}`)
  }
  return atob(encoded)
}

afterEach(() => {
  cleanup()
  clearAccountCache()
  vi.unstubAllGlobals()
})

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

it('shows the signed-in name and email', async () => {
  saveAuthToken('live-token')
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ name: 'Ada Lovelace', email: 'ada@example.com', urlImage: 'ada.png' }),
      ),
  )
  render(<AccountSummary />)
  expect(await screen.findByText('Ada Lovelace')).toBeTruthy()
  expect(screen.getByText('ada@example.com')).toBeTruthy()
  expect(document.querySelector('img')?.getAttribute('src')).toBe(
    'https://carriers.dentalautomation.ai/pictures/ada.png',
  )
})

it('opens the account menu and logs out', async () => {
  saveAuthToken('live-token')
  const location = { href: 'http://localhost/generate' }
  vi.stubGlobal('location', location)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(jsonResponse({ name: 'Ada Lovelace', email: 'ada@example.com' })),
  )
  render(<AccountSummary />)
  fireEvent.keyDown(await screen.findByRole('button', { name: 'Ada Lovelace' }), { key: 'Enter' })
  expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeTruthy()
  expect(screen.getAllByText('ada@example.com').length).toBeGreaterThan(1)
  fireEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
  expect(readStoredToken()).toBeNull()
  expect(loginReturnUrl(location.href)).toBe('http://localhost/generate')
})

it('shows a person icon when the account has no photo', async () => {
  saveAuthToken('live-token')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(jsonResponse({ name: 'Ada Lovelace', email: 'ada@example.com' })),
  )
  render(<AccountSummary />)
  expect(await screen.findByText('Ada Lovelace')).toBeTruthy()
  expect(document.querySelector('img')).toBeNull()
  expect(document.querySelector('.lucide-user')).toBeTruthy()
})

it('drops the session and returns to login when the token is rejected', async () => {
  saveAuthToken('expired-token')
  const location = { href: 'http://localhost/generate?portal=toolkit' }
  vi.stubGlobal('location', location)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(jsonResponse({ message: 'Invalid or expired token' }, 401)),
  )
  render(<AccountSummary />)
  await waitFor(() => expect(readStoredToken()).toBeNull())
  expect(loginReturnUrl(location.href)).toBe('http://localhost/generate?portal=toolkit')
  expect(screen.queryByText('Account details unavailable')).toBeNull()
})

it('keeps the session and explains a failed profile request', async () => {
  saveAuthToken('live-token')
  const location = { href: 'http://localhost/generate' }
  vi.stubGlobal('location', location)
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  render(<AccountSummary />)
  expect(await screen.findByText('Account details unavailable')).toBeTruthy()
  expect(readStoredToken()).toBe('live-token')
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }))
  expect(readStoredToken()).toBeNull()
  expect(loginReturnUrl(location.href)).toBe('http://localhost/generate')
})

it('renders nothing when there is no session', () => {
  const { container } = render(<AccountSummary />)
  expect(container.textContent).toBe('')
})
