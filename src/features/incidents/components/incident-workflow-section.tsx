import { ListTodo } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { INCIDENT_STATUSES } from '../constants/statuses'
import type { Incident } from '../types/incident'
import { DetailSection } from './detail-section'

function StatusTimeline({ status }: { status: Incident['status'] }) {
  const currentIndex = INCIDENT_STATUSES.findIndex((step) => step.id === status)

  return (
    <ol className="space-y-0" aria-label="Status">
      {INCIDENT_STATUSES.map((step, index) => {
        const Icon = step.icon
        const reached = index <= currentIndex
        const current = index === currentIndex
        const last = index === INCIDENT_STATUSES.length - 1
        return (
          <li key={step.id} className="relative flex gap-2.5">
            <div className="flex w-4 shrink-0 flex-col items-center">
              <span
                className={cn(
                  'relative z-10 mt-0.5 inline-flex size-4 items-center justify-center',
                  current && 'scale-110',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn('size-3.5', reached ? step.tone : 'text-muted-foreground/35')}
                />
              </span>
              {last ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 mb-0.5 min-h-2.5 w-px flex-1',
                    index < currentIndex ? 'bg-foreground/30' : 'bg-border',
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                'pb-2 text-xs leading-4',
                last && 'pb-0',
                current ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {step.label}
              {current ? <span className="sr-only"> (current)</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function IncidentWorkflowSection({ incident }: { incident: Incident }) {
  return (
    <DetailSection id="props-workflow" title="Workflow" icon={ListTodo}>
      <StatusTimeline status={incident.status} />
    </DetailSection>
  )
}
