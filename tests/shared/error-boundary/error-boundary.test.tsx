import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../../../src/shared/error-boundary'

let shouldThrow = true
function Broken() {
  if (shouldThrow) throw new Error('render failure')
  return <p>Recovered content</p>
}

beforeEach(() => {
  shouldThrow = true
  // React logs caught render errors; keep the test output clean.
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('renders children when nothing fails', () => {
  render(
    <ErrorBoundary>
      <p>Healthy content</p>
    </ErrorBoundary>,
  )
  expect(screen.getByText('Healthy content')).toBeTruthy()
  expect(screen.queryByRole('alert')).toBeNull()
})

it('shows a recovery screen instead of a blank page when a child fails', () => {
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('alert')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeTruthy()
})

it('renders the children again after Try again when the problem is gone', () => {
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  )
  shouldThrow = false
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(screen.getByText('Recovered content')).toBeTruthy()
})

it('reloads the page from the Reload button', () => {
  const reload = vi.fn()
  vi.stubGlobal('location', { reload })
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
  expect(reload).toHaveBeenCalledOnce()
  vi.unstubAllGlobals()
})

it('resets when its key changes, like a navigation does', () => {
  const { rerender } = render(
    <ErrorBoundary key="/a">
      <Broken />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('alert')).toBeTruthy()
  shouldThrow = false
  rerender(
    <ErrorBoundary key="/b">
      <Broken />
    </ErrorBoundary>,
  )
  expect(screen.getByText('Recovered content')).toBeTruthy()
})
