import { describe, expect, it } from 'vitest'
import { GENERAL_CARRIER } from '../../../src/features/incidents/constants/catalog'
import { createSeedIncidents } from '../../../src/features/incidents/services/seed-incidents'
import {
  applyFiltersToParams,
  countActiveFilters,
  EMPTY_FILTERS,
  filterIncidents,
  filtersFromParams,
  hasActiveFilters,
  sortIncidents,
} from '../../../src/features/incidents/utils/filter-incidents'

const ME = 'me@example.com'
const INCIDENTS = createSeedIncidents(new Date(2026, 10, 23, 12), ME)
const keys = (incidents: readonly { id: string }[]) =>
  incidents.map((incident) => incident.id.slice(-8))
const search = (query: string) => keys(filterIncidents(INCIDENTS, { ...EMPTY_FILTERS, query }))

describe('filterIncidents', () => {
  it('returns everything with empty filters', () => {
    expect(filterIncidents(INCIDENTS, EMPTY_FILTERS)).toHaveLength(INCIDENTS.length)
  })

  it('searches title, ID, carrier, category, assignee and clinic ID', () => {
    expect(search('MFA')).toEqual(['8HD2LQ0P'])
    expect(search('inc-20261121-3c2qs146')).toEqual(['3C2QS146'])
    expect(search('CL-4120').length).toBeGreaterThan(0)
    expect(search('portal access')).toEqual(expect.arrayContaining(['8HD2LQ0P', 'F6J3TS9W']))
    expect(search('morgan blake')).toEqual(expect.arrayContaining(['Q7M1ZK3A']))
  })

  it('requires every search term to match (AND), in any field', () => {
    expect(search('umr critical deductible')).toEqual([])
    expect(search('umr deductible')).toEqual(['ZP4M7Q2N'])
    expect(search('  delta   ortho ')).toEqual(['LX2C8V6R'])
  })

  it('combines facets with AND and values within a facet with OR', () => {
    const result = filterIncidents(INCIDENTS, {
      ...EMPTY_FILTERS,
      clients: ['Harbor Orthodontics', 'Bright Smile Dental Group'],
      carriers: ['UMR'],
    })
    expect(keys(result).sort()).toEqual(['3C2QS146', 'ZP4M7Q2N'])
  })

  it('matches general carrier and client filters', () => {
    const general = filterIncidents(INCIDENTS, { ...EMPTY_FILTERS, carriers: [GENERAL_CARRIER] })
    expect(general.every((incident) => incident.carrier === null)).toBe(true)

    const harbor = filterIncidents(INCIDENTS, {
      ...EMPTY_FILTERS,
      clients: ['Harbor Orthodontics'],
    })
    expect(harbor.length).toBeGreaterThan(0)
    expect(harbor.every((incident) => incident.client === 'Harbor Orthodontics')).toBe(true)
  })
})

describe('filter helpers', () => {
  it('counts facets, not values, and treats search separately', () => {
    const filters = {
      ...EMPTY_FILTERS,
      clients: ['Harbor Orthodontics'],
      carriers: ['UMR'],
    }
    expect(countActiveFilters(filters)).toBe(2)
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '  ' })).toBe(false)
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: 'umr' })).toBe(true)
  })

  it('sorts by priority, then soonest expected date, then newest created', () => {
    const sorted = sortIncidents(INCIDENTS)
    expect(sorted[0]?.priority).toBe('extremely_high')
    const open = sorted.filter((incident) => incident.status !== 'done')
    const done = sorted.filter((incident) => incident.status === 'done')
    expect(sorted).toEqual([...open, ...done])
    expect(open.at(-1)?.priority).toBe('low')
    // Within a priority: soonest expected date first, undated last.
    const high = open.filter((incident) => incident.priority === 'high')
    const dates = high.map((incident) => incident.expectedDate ?? '9999')
    expect(dates).toEqual([...dates].sort())
    // Done: most recently delivered first.
    const delivered = done.map((incident) => incident.deliveredDate ?? '')
    expect(delivered).toEqual([...delivered].sort().reverse())
  })

  it('does not reorder cards when only updatedAt changes (watching)', () => {
    const bumped = INCIDENTS.map((incident, index) =>
      index === 5 ? { ...incident, updatedAt: '2099-01-01T00:00:00.000Z' } : incident,
    )
    expect(keys(sortIncidents(bumped))).toEqual(keys(sortIncidents(INCIDENTS)))
  })

  it('round-trips filters through URL params and keeps unrelated params', () => {
    const filters = {
      query: 'umr form',
      clients: ['Harbor Orthodontics'],
      carriers: [GENERAL_CARRIER],
    }
    const params = applyFiltersToParams(new URLSearchParams('view=board'), filters)
    expect(params.get('view')).toBe('board')
    expect(filtersFromParams(params)).toEqual(filters)
    expect(applyFiltersToParams(params, EMPTY_FILTERS).toString()).toBe('view=board')
    // Legacy removed keys are dropped.
    expect(
      applyFiltersToParams(
        new URLSearchParams('priority=high&mine=1&watching=1&assignee=u-sam'),
        EMPTY_FILTERS,
      ).toString(),
    ).toBe('')
  })
})
