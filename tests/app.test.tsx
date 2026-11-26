import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter } from 'react-router'
import App from '../src/App'
import { saveAuthToken } from '../src/features/auth/services/session'

vi.mock('../src/features/auth/services/load-account', () => {
  const profile = { name: 'Test User', email: 'test@example.com', imageUrl: null }
  const ready = { status: 'ready' as const, profile }
  return {
    subscribeAccount: () => () => undefined,
    getAccountSnapshot: () => ready,
    getAccountProfile: () => profile,
  }
})

function renderAt(path: string) {
  render(<App createRouter={(routes) => createMemoryRouter(routes, { initialEntries: [path] })} />)
}

beforeEach(() => {
  saveAuthToken('test-token')
})

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('renders the incidents board on the home route', () => {
    renderAt('/')
    expect(screen.queryByRole('heading', { name: 'In review' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Pending' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'In progress' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Done' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).toBeNull()
  })

  it('redirects /incidents to the home board', async () => {
    renderAt('/incidents')
    expect(await screen.findByRole('heading', { name: 'Pending' })).toBeTruthy()
  })

  it('shows a not found page for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })
})
