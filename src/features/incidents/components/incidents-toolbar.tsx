import { Plus, Search } from 'lucide-react'
import type { Ref } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useOverlayNavigation, type OverlayState } from '../hooks/use-overlay-navigation'
import { loadCreateIncidentPage, preload } from '../pages/lazy-pages'
import type { IncidentFilters } from '../utils/filter-incidents'
import { InlineFilters } from './incidents-filters'

export function IncidentsToolbar({
  filters,
  resultCount,
  totalCount,
  searchRef,
  onChange,
}: {
  filters: IncidentFilters
  resultCount: number
  totalCount: number
  searchRef: Ref<HTMLInputElement>
  onChange: (next: IncidentFilters) => void
}) {
  const overlay = useOverlayNavigation()

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-lg font-semibold tracking-tight">Board</h1>
        <div className="relative w-full min-w-0 sm:w-64">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            ref={searchRef}
            type="search"
            aria-label="Search incidents"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && filters.query) {
                event.stopPropagation()
                onChange({ ...filters, query: '' })
              }
            }}
            placeholder="Search title, ID, carrier…"
            className="pl-9"
          />
        </div>

        <div aria-hidden="true" className="bg-border mx-1 hidden h-6 w-px shrink-0 sm:block" />

        <InlineFilters filters={filters} onChange={onChange} />

        <div className="ml-auto flex items-center gap-2">
          <p className="text-muted-foreground mr-1 text-sm tabular-nums" aria-live="polite">
            {resultCount === totalCount
              ? `${totalCount} ${totalCount === 1 ? 'incident' : 'incidents'}`
              : `${resultCount} of ${totalCount}`}
          </p>
          <Button asChild>
            <Link
              to={overlay.to('/incidents/new')}
              state={{ canGoBack: true } satisfies OverlayState}
              onPointerEnter={() => preload(loadCreateIncidentPage)}
              onFocus={() => preload(loadCreateIncidentPage)}
            >
              <Plus aria-hidden="true" />
              New incident
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
