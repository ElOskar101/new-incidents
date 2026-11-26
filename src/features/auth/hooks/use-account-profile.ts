import { useSyncExternalStore } from 'react'
import type { AccountProfile } from '../services/current-user'
import { getAccountProfile, subscribeAccount } from '../services/load-account'
import { readStoredToken } from '../services/session'

const noop = () => undefined

export function useAccountProfile(): AccountProfile | null {
  const token = readStoredToken()
  return useSyncExternalStore(
    (listener) => (token ? subscribeAccount(token, listener) : noop),
    getAccountProfile,
  )
}
