import { createContext, useContext } from 'react'
import type { Incident, IncidentStatus } from '../types/incident'

export interface MoveOptions {
  notify?: boolean
}

export type RequestMove = (
  incident: Incident,
  status: IncidentStatus,
  options?: MoveOptions,
) => void

export const RequestMoveContext = createContext<RequestMove | null>(null)

export function useRequestMove(): RequestMove {
  const requestMove = useContext(RequestMoveContext)
  if (!requestMove) throw new Error('useRequestMove must be used within an IncidentMoveProvider')
  return requestMove
}
