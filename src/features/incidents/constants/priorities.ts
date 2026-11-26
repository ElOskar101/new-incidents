import type { IncidentPriority } from '../types/incident'

export interface PriorityMeta {
  id: IncidentPriority
  label: string
  rank: number
  tone: string
  band: string
  bandForeground: string
}

export const INCIDENT_PRIORITIES: readonly PriorityMeta[] = [
  {
    id: 'extremely_high',
    label: 'Extremely high',
    rank: 5,
    tone: 'text-danger-strong',
    band: 'bg-priority-band-5',
    bandForeground: 'text-priority-band-foreground',
  },
  {
    id: 'important',
    label: 'Important',
    rank: 4,
    tone: 'text-warning-strong',
    band: 'bg-priority-band-4',
    bandForeground: 'text-priority-band-foreground',
  },
  {
    id: 'high',
    label: 'High',
    rank: 3,
    tone: 'text-foreground',
    band: 'bg-priority-band-3',
    bandForeground: 'text-priority-band-foreground',
  },
  {
    id: 'standard',
    label: 'Standard',
    rank: 2,
    tone: 'text-muted-foreground',
    band: 'bg-priority-band-2',
    bandForeground: 'text-priority-band-foreground',
  },
  {
    id: 'low',
    label: 'Low',
    rank: 1,
    tone: 'text-muted-foreground',
    band: 'bg-priority-band-1',
    bandForeground: 'text-priority-band-foreground',
  },
]

export const PRIORITY_BY_ID = Object.fromEntries(
  INCIDENT_PRIORITIES.map((priority) => [priority.id, priority]),
) as Record<IncidentPriority, PriorityMeta>
