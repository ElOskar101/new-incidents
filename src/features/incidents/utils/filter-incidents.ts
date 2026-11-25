import { GENERAL_CARRIER } from '../constants/catalog'
import { PRIORITY_BY_ID } from '../constants/priorities'
import type { Incident } from '../types/incident'

export interface IncidentFilters {
  query: string
  clients: string[]
  carriers: string[]
}

export const EMPTY_FILTERS: IncidentFilters = {
  query: '',
  clients: [],
  carriers: [],
}

export function countActiveFilters(filters: IncidentFilters): number {
  return (filters.clients.length > 0 ? 1 : 0) + (filters.carriers.length > 0 ? 1 : 0)
}

export function hasActiveFilters(filters: IncidentFilters): boolean {
  return filters.query.trim().length > 0 || countActiveFilters(filters) > 0
}

function searchableText(incident: Incident): string {
  return [
    incident.title,
    incident.description,
    incident.id,
    incident.client,
    incident.clinic,
    incident.clinicId,
    incident.carrier ?? 'general',
    incident.category,
    incident.assignee?.name ?? 'unassigned',
  ]
    .join('\n')
    .toLowerCase()
}

function matchesQuery(incident: Incident, terms: readonly string[]): boolean {
  if (terms.length === 0) return true
  const text = searchableText(incident)
  return terms.every((term) => text.includes(term))
}

export function filterIncidents(
  incidents: readonly Incident[],
  filters: IncidentFilters,
): Incident[] {
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return incidents.filter((incident) => {
    if (filters.clients.length > 0 && !filters.clients.includes(incident.client)) return false
    if (
      filters.carriers.length > 0 &&
      !filters.carriers.includes(incident.carrier ?? GENERAL_CARRIER)
    ) {
      return false
    }
    return matchesQuery(incident, terms)
  })
}

function byExpectedDate(a: Incident, b: Incident): number {
  if (a.expectedDate === b.expectedDate) return 0
  if (a.expectedDate === null) return 1
  if (b.expectedDate === null) return -1
  return a.expectedDate.localeCompare(b.expectedDate)
}

/**
 * Open work: highest priority, then the soonest expected date, then newest. Done: most recently
 * delivered first. Only triage fields decide the order, so watching or edits never
 * make a card jump while someone is looking at the board.
 */
export function sortIncidents(incidents: readonly Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const aDone = a.status === 'done'
    if (aDone !== (b.status === 'done')) return aDone ? 1 : -1
    if (aDone) {
      return (
        (b.deliveredDate ?? '').localeCompare(a.deliveredDate ?? '') ||
        b.createdAt.localeCompare(a.createdAt)
      )
    }
    return (
      PRIORITY_BY_ID[b.priority].rank - PRIORITY_BY_ID[a.priority].rank ||
      byExpectedDate(a, b) ||
      b.createdAt.localeCompare(a.createdAt)
    )
  })
}

function list(params: URLSearchParams, key: string): string[] {
  return (params.get(key) ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export function filtersFromParams(params: URLSearchParams): IncidentFilters {
  return {
    query: params.get('q') ?? '',
    clients: list(params, 'client'),
    carriers: list(params, 'carrier'),
  }
}

export function applyFiltersToParams(
  params: URLSearchParams,
  filters: IncidentFilters,
): URLSearchParams {
  const next = new URLSearchParams(params)
  const set = (key: string, value: string) => {
    if (value) next.set(key, value)
    else next.delete(key)
  }
  set('q', filters.query)
  set('client', filters.clients.join(','))
  set('carrier', filters.carriers.join(','))
  // Drop removed filter keys from older URLs.
  next.delete('priority')
  next.delete('assignee')
  next.delete('watching')
  next.delete('mine')
  return next
}
