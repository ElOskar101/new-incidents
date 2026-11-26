import { AlignLeft, BellRing, CalendarClock, CheckCircle2, Globe, Paperclip } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { PRIORITY_BY_ID } from '../constants/priorities'
import { useIsWatching } from '../hooks/use-incidents'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useOverlayNavigation, type OverlayState } from '../hooks/use-overlay-navigation'
import { loadIncidentDetailPage, preload } from '../pages/lazy-pages'
import type { Incident } from '../types/incident'
import { dueState, formatDate, formatDueDays } from '../utils/format'
import { IncidentActionsMenu } from './incident-actions-menu'
import { PersonAvatar, PriorityIcon } from './incident-badges'

export const INCIDENT_DRAG_TYPE = 'application/x-incident-id'
/** Marks card links so focus can return to a neighbor after a delete. */
export const CARD_LINK_SELECTOR = '[data-card-link]'

const DUE_LABEL = { overdue: 'Overdue', soon: 'Due soon' } as const

/** After a delete, focus the card that took its place (or the new last one). */
function focusCardAt(index: number) {
  requestAnimationFrame(() => {
    const links = document.querySelectorAll<HTMLElement>(CARD_LINK_SELECTOR)
    links[Math.min(index, links.length - 1)]?.focus()
  })
}

function PriorityCarrierBand({ incident }: { incident: Incident }) {
  const meta = PRIORITY_BY_ID[incident.priority]
  const carrierLabel = incident.carrier ?? 'General'
  return (
    <div
      className="flex min-w-0 max-w-full items-stretch overflow-hidden rounded-br-md"
      title={`${meta.label} · ${carrierLabel} · ${incident.clinic}`}
    >
      <div
        className={cn(
          'flex min-w-0 items-center gap-1.5 px-1.5 py-0.5 text-xs leading-none font-medium',
          meta.band,
          meta.bandForeground,
        )}
      >
        <PriorityIcon priority={incident.priority} labelled meterClassName="text-current" />
        <span className="bg-priority-band-foreground/35 h-2.5 w-px shrink-0" aria-hidden="true" />
        <span className="inline-flex min-w-0 max-w-[9rem] items-center gap-1 truncate tracking-normal">
          {incident.carrier ? null : (
            <Globe className="size-2.5 shrink-0 opacity-80" aria-hidden="true" />
          )}
          <span className="truncate">{carrierLabel}</span>
        </span>
      </div>
      <span className="bg-muted text-muted-foreground border-border/50 flex min-w-0 items-center border-l px-1.5 py-0.5 text-xs leading-[1.15]">
        <span className="sr-only">Clinic: </span>
        <span className="truncate">{incident.clinic}</span>
      </span>
    </div>
  )
}

export function IncidentCard({
  incident,
  today,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  incident: Incident
  today: string
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
}) {
  const overlay = useOverlayNavigation()
  const workflow = useIncidentsWorkflow()
  const watching = useIsWatching(incident)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const due = dueState(incident, today)

  const handleDeleted = () => {
    const links = Array.from(document.querySelectorAll(CARD_LINK_SELECTOR))
    focusCardAt(linkRef.current ? links.indexOf(linkRef.current) : 0)
  }

  return (
    <article
      draggable
      aria-roledescription="Draggable incident"
      aria-labelledby={`card-${incident.id}`}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData(INCIDENT_DRAG_TYPE, incident.id)
        event.dataTransfer.setData('text/plain', incident.id)
        onDragStart(incident.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group bg-card border-border relative cursor-grab overflow-hidden rounded-md border shadow-xs transition-[box-shadow,border-color,opacity] active:cursor-grabbing',
        'hover:border-foreground/20 hover:shadow-sm has-[a:focus-visible]:ring-ring/50 has-[a:focus-visible]:ring-[3px]',
        isDragging && 'opacity-40',
      )}
    >
      <div className="relative flex min-w-0 items-center pr-6">
        <PriorityCarrierBand incident={incident} />
        <div className="absolute top-1/2 right-0.5 z-10 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 has-[[data-state=open]]:opacity-100">
          <IncidentActionsMenu
            incident={incident}
            onDeleted={handleDeleted}
            triggerClassName="size-5 [&_svg]:size-3.5"
          />
        </div>
      </div>

      <div className="space-y-1 px-3 pt-2.5 pb-2">
        <h3 id={`card-${incident.id}`} className="text-sm leading-snug font-medium">
          <Link
            ref={linkRef}
            data-card-link
            to={overlay.to(`/incidents/${incident.id}`)}
            state={{ canGoBack: true } satisfies OverlayState}
            draggable={false}
            onPointerEnter={() => preload(loadIncidentDetailPage)}
            onFocus={() => preload(loadIncidentDetailPage)}
            className="line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-md"
          >
            {incident.title}
          </Link>
        </h3>

        {incident.description.trim() ? (
          <div className="text-muted-foreground mb-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 text-xs leading-relaxed">
            <AlignLeft className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
            <p className="line-clamp-2 min-w-0">
              <span className="sr-only">Description: </span>
              {incident.description}
            </p>
          </div>
        ) : null}

        <div className="border-border text-muted-foreground flex items-center justify-between gap-2 border-t pt-1 text-xs leading-none">
          <div className="flex min-w-0 items-center gap-2">
            {incident.status === 'done' && incident.deliveredDate ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <CheckCircle2 className="text-status-done size-2.5" aria-hidden="true" />
                Delivered {formatDate(incident.deliveredDate)}
              </span>
            ) : incident.expectedDate ? (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1',
                  due === 'overdue' && 'text-danger-strong font-medium',
                  due === 'soon' && 'text-warning-strong font-medium',
                )}
                title={formatDate(incident.expectedDate)}
              >
                <CalendarClock className="size-2.5" aria-hidden="true" />
                <span className="sr-only">{due ? `${DUE_LABEL[due]}, expected` : 'Expected'}</span>
                {formatDueDays(incident.expectedDate, today)}
              </span>
            ) : null}
            {incident.attachments.length > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <Paperclip className="size-2.5" aria-hidden="true" />
                <span className="sr-only">Attachments:</span>
                {incident.attachments.length}
              </span>
            ) : null}
            {watching ? (
              <span className="shrink-0">
                <BellRing className="size-2.5" aria-hidden="true" />
                <span className="sr-only">Notifications on</span>
              </span>
            ) : null}
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              title="Copy ID"
              aria-label={`Copy ID ${incident.id}`}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void workflow.copyText(incident.id, 'ID')
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="hover:text-foreground focus-visible:ring-ring/50 rounded-sm font-mono text-[11px] tracking-wide outline-none focus-visible:ring-2"
            >
              {incident.id}
            </button>
            <PersonAvatar person={incident.reporter} className="size-5 text-2xs" />
          </div>
        </div>
      </div>
    </article>
  )
}
