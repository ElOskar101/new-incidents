export const AUTH_STORAGE_KEY = 'incidents.auth:v1'

const LOGIN_ORIGIN = 'https://auth.controlcentralcarrier.com/'

function resumeUrl(href: string): string {
  const url = new URL(href)
  url.searchParams.delete('key')
  return url.href
}

/**
 * Auth reads `url` as the base64 return address.
 * `=` and `+` are percent-encoded and `/` stays, matching the login site's links.
 */
function loginUrl(returnTo: string): string {
  const encoded = btoa(returnTo).replaceAll('+', '%2B').replaceAll('=', '%3D')
  return `${LOGIN_ORIGIN}?url=${encoded}`
}

export function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveAuthToken(token: string) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
  } catch {
    /* Session stays unavailable when storage is blocked. */
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* Nothing else to clear when storage is blocked. */
  }
}

/** Decodes `key` as the access token and returns the search string without it. */
export function applySessionKey(search: string): string {
  const params = new URLSearchParams(search)
  const key = params.get('key')
  if (key === null) return search
  try {
    const token = atob(key.replaceAll(' ', '+'))
    if (token) saveAuthToken(token)
  } catch {
    /* Ignore invalid keys and keep any existing session. */
  }
  params.delete('key')
  const next = params.toString()
  return next ? `?${next}` : ''
}

export function redirectToLogin() {
  window.location.href = loginUrl(resumeUrl(window.location.href))
}

export function requireSession(): boolean {
  if (readStoredToken()) return true
  redirectToLogin()
  return false
}

export function captureAuthSession() {
  const nextSearch = applySessionKey(window.location.search)
  if (nextSearch === window.location.search) return
  const { pathname, hash } = window.location
  window.history.replaceState(window.history.state, '', `${pathname}${nextSearch}${hash}`)
}
