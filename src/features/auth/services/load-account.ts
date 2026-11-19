import { ApiError } from '@/shared/api'
import { getCurrentUser, type AccountProfile } from './current-user'
import { clearAuthSession, redirectToLogin } from './session'

export type AccountSnapshot =
  | { status: 'loading' }
  | { status: 'ready'; profile: AccountProfile }
  | { status: 'anonymous' }
  | { status: 'unavailable' }

const listeners = new Set<() => void>()
let snapshot: AccountSnapshot = { status: 'loading' }
let activeToken: string | null = null

function publish(next: AccountSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function clearAccountCache() {
  activeToken = null
  snapshot = { status: 'loading' }
}

export function getAccountSnapshot(): AccountSnapshot {
  return snapshot
}

export function subscribeAccount(token: string, listener: () => void) {
  listeners.add(listener)
  if (activeToken !== token) {
    activeToken = token
    snapshot = { status: 'loading' }
    void loadAccount(token)
  }
  return () => listeners.delete(listener)
}

export function retryAccount(token: string) {
  activeToken = token
  publish({ status: 'loading' })
  void loadAccount(token)
}

function loadAccount(token: string) {
  return getCurrentUser(token).then(
    (profile) => {
      if (activeToken === token) publish({ status: 'ready', profile })
    },
    (error: unknown) => {
      if (activeToken !== token) return
      if (error instanceof ApiError && error.status === 401) {
        clearAuthSession()
        publish({ status: 'anonymous' })
        redirectToLogin()
        return
      }
      publish({ status: 'unavailable' })
    },
  )
}
