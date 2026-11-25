import { useMemo, useState, type ReactNode } from 'react'
import { createIncidentsApi, type IncidentsApi } from '../services'
import type { Person } from '../types/incident'
import { IncidentsApiContext } from './incidents-context'

export function IncidentsStoreProvider({
  currentUser,
  api,
  children,
}: {
  currentUser: Person
  api?: IncidentsApi
  children: ReactNode
}) {
  const [value] = useState(() => api ?? createIncidentsApi(currentUser.id))
  const context = useMemo(() => ({ api: value, currentUser }), [value, currentUser])
  return <IncidentsApiContext.Provider value={context}>{children}</IncidentsApiContext.Provider>
}
