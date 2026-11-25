import {
  createLocalIncidentsApi,
  type IncidentsApi,
  type IncidentsApiOptions,
} from './local-incidents-api'
import { createSeedIncidents } from './seed-incidents'

export type {
  IncidentsApi,
  IncidentsApiOptions,
  CreateIncidentOptions,
  IncidentRevert,
} from './local-incidents-api'
export { IncidentNotFoundError, createLocalIncidentsApi } from './local-incidents-api'
export { createSeedIncidents } from './seed-incidents'

// HTTP swap: keep `IncidentsApi`; replace body with `requestJson` + `config.ENDPOINTS.incidents`.
export function createIncidentsApi(
  currentUserId: string,
  options: IncidentsApiOptions = {},
): IncidentsApi {
  return createLocalIncidentsApi(createSeedIncidents(new Date(), currentUserId), options)
}
