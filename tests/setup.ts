import { configure } from '@testing-library/react'
import { beforeEach } from 'vitest'
import { clearAuthSession } from '../src/features/auth/services/session'

beforeEach(() => {
  clearAuthSession()
})

// Pointer helpers and ResizeObserver exist in browsers/jsdom, not in @vitest-environment node.
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => undefined
  HTMLElement.prototype.releasePointerCapture = () => undefined
  HTMLElement.prototype.scrollIntoView = () => undefined
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {
      /* Nothing to observe in jsdom. */
    }
    unobserve() {
      /* Nothing to observe in jsdom. */
    }
    disconnect() {
      /* Nothing to observe in jsdom. */
    }
  }
}

// jsdom does not implement CSS.escape.
if (typeof CSS === 'undefined' || typeof CSS.escape !== 'function') {
  const escape = (value: string) => {
    let result = ''
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index)
      const char = value[index]!
      if (code === 0) {
        result += '\uFFFD'
        continue
      }
      if (
        (code >= 1 && code <= 31) ||
        code === 127 ||
        (index === 0 && code >= 48 && code <= 57) ||
        (index === 1 && code >= 48 && code <= 57 && value.charCodeAt(0) === 45)
      ) {
        result += `\\${code.toString(16)} `
        continue
      }
      if (
        code >= 128 ||
        code === 45 ||
        code === 95 ||
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122)
      ) {
        result += char
        continue
      }
      result += `\\${char}`
    }
    return result
  }
  if (typeof CSS === 'undefined') globalThis.CSS = { escape } as typeof CSS
  else CSS.escape = escape
}

// jsdom does not implement matchMedia; default to stacked layout.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => {
    const mediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }
    return mediaQueryList as unknown as MediaQueryList
  }
}

configure({ asyncUtilTimeout: 3000 })
