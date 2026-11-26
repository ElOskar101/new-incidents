import { createContext } from 'react'
import type { IncidentsApi } from '../services'
import type { Person } from '../types/incident'

export interface IncidentsContextValue {
  api: IncidentsApi
  currentUser: Person
}

export const IncidentsApiContext = createContext<IncidentsContextValue | null>(null)
