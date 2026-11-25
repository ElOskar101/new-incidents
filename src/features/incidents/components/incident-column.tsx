import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DONE_RECENT_DAYS } from '../constants/catalog'
import type { StatusMeta } from '../constants/statuses'
import { useOverlayNavigation } from '../hooks/use-overlay-navigation'
import { loadCreateIncidentPage, preload } from '../pages/lazy-pages'
import type { Incident, IncidentStatus } from '../types/incident'
import { addDays, toDateInputValue } from '../utils/format'
import { StatusIcon } from './incident-badges'
import { INCIDENT_DRAG_TYPE, IncidentCard } from './incident-card'

/** Local calendar day, like `today`, so the 14-day cutoff never shifts by timezone. */
function deliveredOn(incident: Incident): string {
  return incident.deliveredDate ?? toDateInputValue(new Date(incident.updatedAt))
}

export function IncidentColumn({
  status,
  incidents,
  today,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  status: StatusMeta
  incidents: readonly Incident[]
  today: string
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (id: string, status: IncidentStatus) => void
}) {
  const overlay = useOverlayNavigation()
  const [isOver, setIsOver] = useState(false)
  const [showOlder, setShowOlder] = useState(false)
  const headingId = `column-${status.id}`
  const descriptionId = `column-${status.id}-description`
  const dragging = draggingId !== null
  const isSource = draggingId !== null && incidents.some((incident) => incident.id === draggingId)
  const canDrop = draggingId !== null && !isSource

  const cutoff = addDays(today, -DONE_RECENT_DAYS)
  const older =
    status.id === 'done' ? incidents.filter((incident) => deliveredOn(incident) < cutoff) : []
  const visible =
    showOlder || older.length === 0 ? incidents : incidents.filter((i) => !older.includes(i))

  return (
    <section
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes(INCIDENT_DRAG_TYPE)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        if (!isOver) setIsOver(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsOver(false)
        const id = event.dataTransfer.getData(INCIDENT_DRAG_TYPE)
        if (id) onDrop(id, status.id)
      }}
      className={cn(
        'group/column bg-board-column ring-border/70 flex min-h-0 w-[85vw] max-w-80 shrink-0 snap-start flex-col overflow-hidden rounded-lg ring-1 transition-[box-shadow,background-color] sm:w-auto sm:max-w-none sm:min-w-[16.5rem] sm:flex-1',
        canDrop && 'ring-primary/40',
        isOver && canDrop && 'bg-primary-subtle ring-primary ring-2',
      )}
    >
      <header className="flex h-11 items-center justify-between gap-2 pr-2 pl-3">
        <div className="flex min-w-0 items-center gap-2">
          <StatusIcon status={status.id} />
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 id={headingId} className="cursor-default truncate text-sm font-semibold">
                {status.label}
              </h2>
            </TooltipTrigger>
            <TooltipContent side="bottom">{status.description}</TooltipContent>
          </Tooltip>
          <p id={descriptionId} className="sr-only">
            {status.description}
          </p>
          <span
            className="bg-background text-muted-foreground ring-border/70 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-none font-medium tabular-nums ring-1"
            aria-label={`${incidents.length} ${incidents.length === 1 ? 'incident' : 'incidents'}`}
          >
            {incidents.length}
          </span>
        </div>
        {status.id === 'done' ? null : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground size-7 transition-opacity sm:opacity-0 sm:group-focus-within/column:opacity-100 sm:group-hover/column:opacity-100 sm:focus-visible:opacity-100"
                aria-label={`New incident in ${status.label}`}
                onPointerEnter={() => preload(loadCreateIncidentPage)}
                onFocus={() => preload(loadCreateIncidentPage)}
                onClick={() => overlay.open('/incidents/new', { status: status.id })}
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New incident in {status.label}</TooltipContent>
          </Tooltip>
        )}
      </header>

      <ul className="scrollbar-app-hover flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-2 pb-2">
        {visible.length === 0 ? (
          dragging && canDrop ? (
            <li
              className={cn(
                'text-muted-foreground border-border/80 flex flex-1 items-center justify-center rounded-md border border-dashed px-3 text-center text-xs',
                isOver && 'border-primary text-primary',
              )}
            >
              Drop here
            </li>
          ) : (
            <li className="text-muted-foreground px-1 py-1.5 text-xs">No incidents</li>
          )
        ) : (
          visible.map((incident) => (
            <li key={incident.id}>
              <IncidentCard
                incident={incident}
                today={today}
                isDragging={draggingId === incident.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </li>
          ))
        )}
        {older.length > 0 ? (
          <li>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-expanded={showOlder}
                  aria-describedby={`${status.id}-older-hint`}
                  onClick={() => setShowOlder((current) => !current)}
                  className="text-muted-foreground w-full"
                >
                  <ChevronDown
                    className={cn('size-3.5 transition-transform', showOlder && 'rotate-180')}
                    aria-hidden="true"
                  />
                  {showOlder ? 'Hide older' : `Show ${older.length} older`}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Delivered more than {DONE_RECENT_DAYS} days ago
              </TooltipContent>
            </Tooltip>
            <span id={`${status.id}-older-hint`} className="sr-only">
              Delivered more than {DONE_RECENT_DAYS} days ago
            </span>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
