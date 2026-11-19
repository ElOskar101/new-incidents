import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CURRENT_USER_URL,
  getCurrentUser,
  parseAccountProfile,
} from '../../../src/features/auth/services/current-user'
import {
  applySessionKey,
  captureAuthSession,
  clearAuthSession,
  readStoredToken,
  redirectToLogin,
  requireSession,
  saveAuthToken,
} from '../../../src/features/auth/services/session'

function loginReturnUrl(href: string): string {
  const login = new URL(href)
  const encoded = login.searchParams.get('url')
  if (login.origin !== 'https://auth.controlcentralcarrier.com' || !encoded) {
    throw new Error(`Expected a login redirect, received ${href}`)
  }
  return atob(encoded)
}

afterEach(() => {
  clearAuthSession()
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('session key', () => {
  it('decodes the key and stores the token, then drops the key from the query string', () => {
    saveAuthToken('previous')
    expect(applySessionKey(`?key=${encodeURIComponent(btoa('aaa.bbb.ccc'))}&portal=toolkit`)).toBe(
      '?portal=toolkit',
    )
    expect(readStoredToken()).toBe('aaa.bbb.ccc')
    expect(localStorage.getItem('incidents.auth:v1')).toBe('aaa.bbb.ccc')
  })

  it('keeps the stored token when the key is invalid', () => {
    saveAuthToken('previous')
    expect(applySessionKey('?key=invalid!&portal=toolkit')).toBe('?portal=toolkit')
    expect(readStoredToken()).toBe('previous')
  })

  it('keeps the stored token when the key is empty', () => {
    saveAuthToken('previous')
    expect(applySessionKey('?key=&portal=toolkit')).toBe('?portal=toolkit')
    expect(readStoredToken()).toBe('previous')
  })

  it('sends the user to login when there is no token', () => {
    const location = { href: 'http://localhost/generate?portal=toolkit' }
    vi.stubGlobal('location', location)
    expect(requireSession()).toBe(false)
    expect(loginReturnUrl(location.href)).toBe('http://localhost/generate?portal=toolkit')
  })

  it('returns to the current page without the expired token', () => {
    const location = { href: 'http://localhost/compare?portal=toolkit&key=old.token#details' }
    vi.stubGlobal('location', location)
    redirectToLogin()
    expect(loginReturnUrl(location.href)).toBe('http://localhost/compare?portal=toolkit#details')
  })

  it('stays in the app when a token is stored', () => {
    saveAuthToken('session-token')
    expect(requireSession()).toBe(true)
  })

  it('captures the key from the address bar and removes it', () => {
    window.history.replaceState(
      { from: 'auth' },
      '',
      `/generate?key=${btoa('aaa.bbb.ccc')}#details`,
    )
    captureAuthSession()
    expect(readStoredToken()).toBe('aaa.bbb.ccc')
    expect(window.location.pathname).toBe('/generate')
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('#details')
    expect(window.history.state).toEqual({ from: 'auth' })
  })
})

describe('current user', () => {
  it('reads the name and email from a flat or wrapped payload', () => {
    expect(
      parseAccountProfile({ first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' }),
    ).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      imageUrl: null,
    })
    expect(
      parseAccountProfile({
        user: { email: ' ada@example.com ', urlImage: '/ada.png' },
      }),
    ).toEqual({
      name: null,
      email: 'ada@example.com',
      imageUrl: 'https://carriers.dentalautomation.ai/pictures/ada.png',
    })
    expect(parseAccountProfile({ status: 'ok' })).toBeNull()
    expect(parseAccountProfile('nope')).toBeNull()
  })

  it('uses the full name supplied by the identity service', () => {
    expect(parseAccountProfile({ fullName: 'Ada Lovelace', email: 'ada@example.com' })?.name).toBe(
      'Ada Lovelace',
    )
  })

  it('sends the token in x-access-token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ name: 'Ada', email: 'ada@example.com' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await expect(getCurrentUser('secret-token')).resolves.toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      imageUrl: null,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      CURRENT_USER_URL,
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json', 'x-access-token': 'secret-token' },
      }),
    )
  })

  it('rejects a payload with no identity fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' }), { status: 200 })),
    )
    await expect(getCurrentUser('secret-token')).rejects.toMatchObject({ name: 'ApiResponseError' })
  })
})
