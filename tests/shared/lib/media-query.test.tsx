import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery, useSideBySidePdfLayout } from '../../../src/shared/lib/media-query'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function Probe({ query, serverSnapshot }: { query: string; serverSnapshot?: boolean }) {
  const matches = useMediaQuery(query, serverSnapshot)
  return <span>{matches ? 'yes' : 'no'}</span>
}

describe('media query hooks', () => {
  it('reads the client matchMedia snapshot and cleans up on unmount', () => {
    const listeners = new Set<() => void>()
    const media = {
      matches: true,
      media: '(min-width: 1024px)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.add(listener as () => void)
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.delete(listener as () => void)
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
    vi.spyOn(window, 'matchMedia').mockImplementation(() => media)

    function SideBySideProbe() {
      return <span>{useSideBySidePdfLayout() ? 'side' : 'stack'}</span>
    }

    const view = render(<SideBySideProbe />)
    expect(screen.getByText('side')).toBeTruthy()
    expect(listeners.size).toBe(1)
    view.unmount()
    expect(listeners.size).toBe(0)
  })

  it('uses the server snapshot during SSR', () => {
    expect(renderToString(<Probe query="(min-width: 1024px)" serverSnapshot />)).toContain('yes')
    expect(renderToString(<Probe query="(min-width: 1024px)" />)).toContain('no')
  })
})
