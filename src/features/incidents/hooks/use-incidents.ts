import { useContext, useSyncExternalStore } from 'react'
import { IncidentsApiContext, type IncidentsContextValue } from '../store/incidents-context'
import type { Incident, Person } from '../types/incident'

export function useIncidentsContext(): IncidentsContextValue {
  const context = useContext(IncidentsApiContext)
  if (!context) throw new Error('Incidents hooks must be used within an IncidentsStoreProvider')
  return context
}

export function useCurrentUser(): Person {
  return useIncidentsContext().currentUser
}

export function useIncidents(): readonly Incident[] {
  const { api } = useIncidentsContext()
  return useSyncExternalStore(api.subscribe, api.getSnapshot)
}

export function useIncident(id: string | undefined): Incident | undefined {
  const incidents = useIncidents()
  return id ? incidents.find((incident) => incident.id === id) : undefined
}

export function useIsWatching(incident: Incident): boolean {
  return incident.watcherIds.includes(useCurrentUser().id)
}
