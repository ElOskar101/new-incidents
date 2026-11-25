import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SessionGate } from '../../../src/features/auth/components/session-gate'
import { clearAccountCache } from '../../../src/features/auth/services/load-account'
import { AUTH_STORAGE_KEY } from '../../../src/features/auth/services/session'

afterEach(() => {
  cleanup()
  clearAccountCache()
  localStorage.clear()
  document.documentElement.classList.remove('dark', 'light')
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('blocks the app until the identity service validates the token', async () => {
  localStorage.setItem('incidents.theme:v1', 'dark')
  let resolve!: (response: Response) => void
  vi.stubGlobal(
    'fetch',
    vi.fn().mockReturnValue(
      new Promise<Response>((done) => {
        resolve = done
      }),
    ),
  )
  render(
    <SessionGate token="token">
      <div>Protected content</div>
    </SessionGate>,
  )
  expect(screen.queryByText('Protected content')).toBeNull()
  expect(screen.getByRole('status').textContent).toContain('Loading')
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  resolve(new Response(JSON.stringify({ name: 'Ada' }), { status: 200 }))
  expect(await screen.findByText('Protected content')).toBeTruthy()
})

it('shows a brief unavailable message then clears the session and redirects to login', async () => {
  vi.useFakeTimers()
  localStorage.setItem(AUTH_STORAGE_KEY, 'stale-token')
  const location = { href: 'http://localhost/incidents' }
  vi.stubGlobal('location', location)
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

  render(
    <SessionGate token="stale-token">
      <div>Protected content</div>
    </SessionGate>,
  )

  await act(async () => {
    await Promise.resolve()
  })

  expect(screen.getByRole('alert')).toBeTruthy()
  expect(screen.getByText('Unable to verify your session.')).toBeTruthy()
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.queryByText('Protected content')).toBeNull()

  await act(async () => {
    await vi.advanceTimersByTimeAsync(3_000)
  })

  expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  expect(location.href).toMatch(/^https:\/\/auth\.controlcentralcarrier\.com\/\?url=/)
})
