import { SearchX } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/shared/ui/button'
import { INCIDENT_STATUSES } from '../constants/statuses'
import { useIncidents } from '../hooks/use-incidents'
import { useRequestMove } from '../hooks/use-request-move'
import { useToday } from '../hooks/use-today'
import { loadIncidentDetailPage, preload } from '../pages/lazy-pages'
import {
  applyFiltersToParams,
  EMPTY_FILTERS,
  filterIncidents,
  filtersFromParams,
  hasActiveFilters,
  sortIncidents,
  type IncidentFilters,
} from '../utils/filter-incidents'
import { IncidentColumn } from './incident-column'
import { IncidentsToolbar } from './incidents-toolbar'

export function IncidentsBoard() {
  const incidents = useIncidents()
  const requestMove = useRequestMove()
  const today = useToday()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])
  const setFilters = (next: IncidentFilters) =>
    setSearchParams((current) => applyFiltersToParams(current, next), {
      replace: true,
      preventScrollReset: true,
    })

  // Strip removed filter keys (`priority`, `mine`, …) left in old bookmarks.
  useEffect(() => {
    const cleaned = applyFiltersToParams(searchParams, filters)
    if (cleaned.toString() === searchParams.toString()) return
    setSearchParams(cleaned, { replace: true, preventScrollReset: true })
  }, [filters, searchParams, setSearchParams])

  const visible = useMemo(
    () => sortIncidents(filterIncidents(incidents, filters)),
    [incidents, filters],
  )

  useEffect(() => {
    const warm = () => preload(loadIncidentDetailPage)
    // Safari has no requestIdleCallback.
    if (typeof (window as Partial<Window>).requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(warm, { timeout: 3000 })
      return () => window.cancelIdleCallback(handle)
    }
    const timer = window.setTimeout(warm, 1500)
    return () => window.clearTimeout(timer)
  }, [])

  const noMatches = visible.length === 0 && hasActiveFilters(filters)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="shrink-0">
        <IncidentsToolbar
          filters={filters}
          resultCount={visible.length}
          totalCount={incidents.length}
          searchRef={searchRef}
          onChange={setFilters}
        />
      </div>

      {noMatches ? (
        <div className="border-border flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <SearchX className="text-muted-foreground size-6" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">No incidents match these filters</p>
            <p className="text-muted-foreground text-sm">
              Try a different search or remove some filters.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className="scrollbar-app-hover -mx-5 flex min-h-0 flex-1 snap-x scroll-px-5 gap-3 overflow-x-auto overflow-y-hidden px-5 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
          aria-label="Incidents board"
          role="region"
        >
          {INCIDENT_STATUSES.map((status) => (
            <IncidentColumn
              key={status.id}
              status={status}
              incidents={visible.filter((incident) => incident.status === status.id)}
              today={today}
              draggingId={draggingId}
              onDragStart={setDraggingId}
              onDragEnd={() => setDraggingId(null)}
              onDrop={(id, next) => {
                setDraggingId(null)
                const incident = incidents.find((current) => current.id === id)
                if (incident) requestMove(incident, next)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
