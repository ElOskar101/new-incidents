import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { TEAM, UNASSIGNED, teamMember } from '../constants/catalog'
import { INCIDENT_PRIORITIES } from '../constants/priorities'
import { INCIDENT_STATUSES } from '../constants/statuses'
import type { IncidentPriority, IncidentStatus, Person } from '../types/incident'
import { PersonAvatar, PriorityIcon, StatusIcon } from './incident-badges'

interface TriggerProps {
  id: string
  className?: string
  size?: 'sm' | 'default'
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-label'?: string
}

function triggerProps({ className, ...props }: TriggerProps) {
  return { ...props, className: className ?? 'w-full' }
}

export function StatusSelect({
  value,
  onChange,
  ...trigger
}: TriggerProps & { value: IncidentStatus; onChange: (status: IncidentStatus) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as IncidentStatus)}>
      <SelectTrigger {...triggerProps(trigger)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {INCIDENT_STATUSES.map((status) => (
          <SelectItem key={status.id} value={status.id}>
            <StatusIcon status={status.id} />
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function PrioritySelect({
  value,
  onChange,
  ...trigger
}: TriggerProps & { value: IncidentPriority; onChange: (priority: IncidentPriority) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as IncidentPriority)}>
      <SelectTrigger {...triggerProps(trigger)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {INCIDENT_PRIORITIES.map((priority) => (
          <SelectItem key={priority.id} value={priority.id}>
            <PriorityIcon priority={priority.id} />
            {priority.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AssigneeSelect({
  value,
  onChange,
  ...trigger
}: TriggerProps & { value: Person | null; onChange: (assignee: Person | null) => void }) {
  return (
    <Select
      value={value?.id ?? UNASSIGNED}
      onValueChange={(id) => onChange(id === UNASSIGNED ? null : (teamMember(id) ?? null))}
    >
      <SelectTrigger {...triggerProps(trigger)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>
          <PersonAvatar person={null} decorative className="size-5" />
          Unassigned
        </SelectItem>
        {TEAM.map((person) => (
          <SelectItem key={person.id} value={person.id}>
            <PersonAvatar person={person} decorative className="size-5" />
            {person.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
