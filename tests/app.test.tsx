import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { saveAuthToken } from '../src/features/auth/services/session'

vi.mock('../src/features/auth/services/load-account', () => {
  const ready = {
    status: 'ready' as const,
    profile: { name: 'Test User', email: 'test@example.com', imageUrl: null },
  }
  return {
    subscribeAccount: () => () => undefined,
    getAccountSnapshot: () => ready,
    retryAccount: () => undefined,
  }
})

beforeEach(() => {
  saveAuthToken('test-token')
})

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('renders the home page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
  })

  it('renders the incidents placeholder', () => {
    render(
      <MemoryRouter initialEntries={['/incidents']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Incidents' })).toBeTruthy()
    expect(screen.getByText('Coming soon.')).toBeTruthy()
  })
})
