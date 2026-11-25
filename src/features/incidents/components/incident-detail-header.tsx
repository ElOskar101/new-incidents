import {
  Bell,
  BellRing,
  Copy,
  FileOutput,
  Link2,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SheetClose, SheetDescription } from '@/shared/ui/sheet'
import { useIsWatching } from '../hooks/use-incidents'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useNow } from '../hooks/use-now'
import { useOverlayNavigation, type OverlayState } from '../hooks/use-overlay-navigation'
import { loadEditIncidentPage, preload } from '../pages/lazy-pages'
import type { Incident } from '../types/incident'
import { formatDateTime, formatRelative } from '../utils/format'
import { IconAction } from './icon-action'
import { PersonAvatar, StatusIcon } from './incident-badges'

function resultUnavailableReason(incident: Incident): string | null {
  if (incident.executionDate === null) return 'Available once the automation has run.'
  return null
}

export function IncidentDetailHeader({
  incident,
  editPath,
  onDelete,
}: {
  incident: Incident
  editPath: string
  onDelete: () => void
}) {
  const workflow = useIncidentsWorkflow()
  const overlay = useOverlayNavigation()
  const watching = useIsWatching(incident)
  const now = new Date(useNow())
  const resultBlocked = resultUnavailableReason(incident)

  return (
    <header
      data-print-hidden
      className="border-border flex h-12 shrink-0 items-center gap-3 border-b px-4"
    >
      <div className="flex min-w-0 items-center gap-2">
        <StatusIcon status={incident.status} />
        <button
          type="button"
          onClick={() => void workflow.copyText(incident.id, 'ID')}
          title="Copy ID"
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring group -mx-1 inline-flex min-w-0 items-center gap-1.5 rounded-sm px-1 font-mono text-xs outline-none focus-visible:outline-2"
          aria-label={`Copy ID ${incident.id}`}
        >
          <span className="truncate">{incident.id}</span>
          <Copy
            className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70"
            aria-hidden="true"
          />
        </button>
      </div>

      <span className="bg-border hidden h-4 w-px shrink-0 sm:block" aria-hidden="true" />

      <SheetDescription className="text-muted-foreground min-w-0 items-center gap-2 text-xs max-sm:sr-only sm:flex">
        <PersonAvatar person={incident.reporter} decorative className="size-5 text-2xs" />
        <span className="truncate">
          <span className="text-muted-foreground">Reported by </span>
          <span className="text-foreground font-medium">{incident.reporter.name}</span>
          <span className="text-muted-foreground/70"> · </span>
          <time dateTime={incident.createdAt} title={formatDateTime(incident.createdAt, now)}>
            {formatRelative(incident.createdAt, now)}
          </time>
        </span>
      </SheetDescription>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <IconAction
          label={watching ? 'Turn off notifications' : 'Turn on notifications'}
          pressed={watching}
          onClick={() => void workflow.setWatching(incident.id, !watching)}
        >
          {watching ? <BellRing /> : <Bell />}
        </IconAction>
        <IconAction label="Copy link" onClick={() => void workflow.copyLink(incident.id)}>
          <Link2 />
        </IconAction>
        <Button asChild variant="outline" size="sm">
          <Link
            to={overlay.to(editPath)}
            state={{ canGoBack: true } satisfies OverlayState}
            onPointerEnter={() => preload(loadEditIncidentPage)}
            onFocus={() => preload(loadEditIncidentPage)}
          >
            <Pencil aria-hidden="true" />
            Edit
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem
              disabled={resultBlocked !== null}
              aria-describedby={resultBlocked ? 'request-result-reason' : undefined}
              onSelect={() => workflow.requestResult(incident)}
              className="items-start"
            >
              <FileOutput className="mt-0.5" />
              <span className="flex flex-col">
                Request result
                {resultBlocked ? (
                  <span id="request-result-reason" className="text-muted-foreground text-xs">
                    {resultBlocked}
                  </span>
                ) : null}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => window.print()}>
              <Printer />
              Print or save as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void workflow.copyText(incident.id, 'ID')}>
              <Copy />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 />
              Delete incident
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SheetClose asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
            <X />
          </Button>
        </SheetClose>
      </div>
    </header>
  )
}
