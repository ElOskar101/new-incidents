import { useMemo } from 'react'
import { Outlet } from 'react-router'
import { useAccountProfile } from '@/features/auth'
import { IncidentsStoreProvider, resolveCurrentUser } from '@/features/incidents'

const SIGNED_OUT = { name: null, email: null }

export function IncidentsShellLayout() {
  const profile = useAccountProfile()
  const currentUser = useMemo(() => resolveCurrentUser(profile ?? SIGNED_OUT), [profile])

  return (
    <IncidentsStoreProvider currentUser={currentUser}>
      <Outlet />
    </IncidentsStoreProvider>
  )
}
