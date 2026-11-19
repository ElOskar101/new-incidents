import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SessionGate } from '../../../src/features/auth/components/session-gate'
import { clearAccountCache } from '../../../src/features/auth/services/load-account'

afterEach(() => {
  cleanup()
  clearAccountCache()
  localStorage.removeItem('vite-ui-theme')
  document.documentElement.classList.remove('dark', 'light')
  vi.unstubAllGlobals()
})

it('blocks the app until the identity service validates the token', async () => {
  localStorage.setItem('vite-ui-theme', 'dark')
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

it('blocks the app on a network failure and allows retry', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Ada' }), { status: 200 })),
  )
  render(
    <SessionGate token="token">
      <div>Protected content</div>
    </SessionGate>,
  )
  expect(await screen.findByText('Unable to verify your session.')).toBeTruthy()
  expect(screen.queryByText('Protected content')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByText('Protected content')).toBeTruthy()
})
