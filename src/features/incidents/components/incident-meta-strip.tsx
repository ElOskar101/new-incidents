import { PRIORITY_BY_ID } from '../constants/priorities'
import { useNow } from '../hooks/use-now'
import type { Incident } from '../types/incident'
import { formatDateTime, formatRelative } from '../utils/format'
import { PersonAvatar, PriorityIcon } from './incident-badges'

export function IncidentHeroMeta({ incident }: { incident: Incident }) {
  const now = new Date(useNow())
  const priority = PRIORITY_BY_ID[incident.priority]
  const assignee = incident.assignee?.name ?? 'Unassigned'

  return (
    <div role="group" aria-label="Incident details" className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span
          className="inline-flex items-center gap-1.5 font-medium"
          title={`${priority.label} priority`}
        >
          <PriorityIcon priority={incident.priority} labelled />
          <span className={priority.tone}>{priority.label}</span>
        </span>
        <span className="bg-border hidden h-3 w-px sm:block" aria-hidden="true" />
        <span className="text-muted-foreground inline-flex min-w-0 items-center gap-1.5">
          <PersonAvatar person={incident.assignee} decorative className="size-5 text-2xs" />
          <span className="text-foreground truncate font-medium">{assignee}</span>
        </span>
      </div>

      <p className="text-muted-foreground text-2xs leading-relaxed">
        <span className="sr-only">Created </span>
        <time dateTime={incident.createdAt} title={formatDateTime(incident.createdAt, now)}>
          Opened {formatDateTime(incident.createdAt, now)}
        </time>
        <span aria-hidden="true" className="text-muted-foreground/50 mx-1.5">
          ·
        </span>
        <span className="sr-only">Updated </span>
        <time dateTime={incident.updatedAt} title={formatDateTime(incident.updatedAt, now)}>
          Updated {formatRelative(incident.updatedAt, now)}
        </time>
      </p>
    </div>
  )
}
