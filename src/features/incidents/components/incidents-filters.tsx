import { Button } from '@/shared/ui/button'
import { MultiCombobox } from '@/shared/ui/multi-combobox'
import { CARRIER_OPTIONS, CLIENT_OPTIONS } from '../constants/options'
import { EMPTY_FILTERS, hasActiveFilters, type IncidentFilters } from '../utils/filter-incidents'

export function InlineFilters({
  filters,
  onChange,
}: {
  filters: IncidentFilters
  onChange: (next: IncidentFilters) => void
}) {
  const active = hasActiveFilters({ ...filters, query: '' })

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="w-full min-w-0 sm:w-44">
        <MultiCombobox
          id="filter-client"
          values={filters.clients}
          placeholder="All clients"
          searchPlaceholder="Search clients…"
          options={CLIENT_OPTIONS}
          onChange={(clients) => onChange({ ...filters, clients })}
        />
      </div>
      <div className="w-full min-w-0 sm:w-44">
        <MultiCombobox
          id="filter-carrier"
          values={filters.carriers}
          placeholder="All carriers"
          searchPlaceholder="Search carriers…"
          options={CARRIER_OPTIONS}
          onChange={(carriers) => onChange({ ...filters, carriers })}
        />
      </div>
      {active ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-9 px-2 text-xs"
          onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}
