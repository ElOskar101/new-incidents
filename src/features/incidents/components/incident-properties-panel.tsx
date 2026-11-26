import { Building2, CalendarClock, Copy, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useNow } from '../hooks/use-now'
import type { Incident } from '../types/incident'
import { dueState, formatDate, formatDueDays, toDateInputValue } from '../utils/format'
import { DetailSection } from './detail-section'
import { IncidentWorkflowSection } from './incident-workflow-section'

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground text-2xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-xs leading-snug break-words">{children}</dd>
    </div>
  )
}

function PropertySection({
  id,
  title,
  icon,
  children,
}: {
  id: string
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <DetailSection id={id} title={title} icon={icon}>
      <dl className="divide-border/70 space-y-2 divide-y [&>*:not(:first-child)]:pt-2">
        {children}
      </dl>
    </DetailSection>
  )
}

export function IncidentPropertiesPanel({ incident }: { incident: Incident }) {
  const workflow = useIncidentsWorkflow()
  const now = new Date(useNow())
  const due = dueState(incident, toDateInputValue(now))
  const today = toDateInputValue(now)

  return (
    <aside
      aria-label="Properties"
      className="border-border space-y-3 border-t bg-transparent p-4 md:border-t-0 md:border-l md:p-5"
    >
      <IncidentWorkflowSection incident={incident} />

      <PropertySection id="props-context" title="Context" icon={Building2}>
        <Property label="Category">{incident.category}</Property>
        <Property label="Carrier">
          {incident.carrier ?? (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="text-muted-foreground size-3.5" aria-hidden="true" />
              General
            </span>
          )}
        </Property>
        <Property label="Client">{incident.client}</Property>
        <Property label="Clinic">{incident.clinic}</Property>
        <Property label="Clinic ID">
          <button
            type="button"
            onClick={() => void workflow.copyText(incident.clinicId, 'Clinic ID')}
            className="hover:text-primary focus-visible:ring-ring/50 group inline-flex items-center gap-1.5 rounded font-mono text-xs outline-none focus-visible:ring-2"
            aria-label={`Copy clinic ID ${incident.clinicId}`}
          >
            {incident.clinicId}
            <Copy className="size-3 opacity-0 group-hover:opacity-100" aria-hidden="true" />
          </button>
        </Property>
      </PropertySection>

      <PropertySection id="props-dates" title="Dates" icon={CalendarClock}>
        <Property label="Executed">{formatDate(incident.executionDate, now)}</Property>
        <Property label="Expected">
          {incident.expectedDate ? (
            <span
              className={cn(
                due === 'overdue' && 'text-danger-strong font-medium',
                due === 'soon' && 'text-warning-strong font-medium',
              )}
              title={formatDate(incident.expectedDate, now)}
            >
              {formatDueDays(incident.expectedDate, today)}
              <span className="text-muted-foreground font-normal">
                {' '}
                · {formatDate(incident.expectedDate, now)}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Property>
        <Property label="Delivered">
          {incident.deliveredDate ? (
            formatDate(incident.deliveredDate, now)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Property>
      </PropertySection>
    </aside>
  )
}
