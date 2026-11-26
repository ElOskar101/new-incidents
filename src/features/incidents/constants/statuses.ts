import { CheckCircle2, CircleDashed, CircleDot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IncidentStatus } from '../types/incident'

export interface StatusMeta {
  id: IncidentStatus
  label: string
  description: string
  icon: LucideIcon
  /** `--status-*` token for the icon. Kept away from primary so it never reads as a link. */
  tone: string
}

export const INCIDENT_STATUSES: readonly StatusMeta[] = [
  {
    id: 'pending',
    label: 'Pending',
    description: 'Accepted, not started yet',
    icon: CircleDashed,
    tone: 'text-status-pending',
  },
  {
    id: 'in_progress',
    label: 'In progress',
    description: 'Someone is working on it',
    icon: CircleDot,
    tone: 'text-status-progress',
  },
  {
    id: 'done',
    label: 'Done',
    description: 'Resolved and delivered',
    icon: CheckCircle2,
    tone: 'text-status-done',
  },
]

export const STATUS_BY_ID = Object.fromEntries(
  INCIDENT_STATUSES.map((status) => [status.id, status]),
) as Record<IncidentStatus, StatusMeta>
