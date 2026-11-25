import { UserRound } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { PRIORITY_BY_ID } from '../constants/priorities'
import { STATUS_BY_ID } from '../constants/statuses'
import type { IncidentPriority, IncidentStatus, Person } from '../types/incident'
import { initials } from '../utils/format'

const DOT_LEVELS = [1, 2, 3, 4, 5] as const

// SVG dots: even circles; tone on `<svg>` so SelectItem doesn't force muted; `size-auto` vs `[&_svg]:size-4`.
function PriorityDotMeter({ lit, className }: { lit: number; className?: string }) {
  return (
    <svg
      width={22}
      height={10}
      viewBox="0 0 44 20"
      className={cn('size-auto h-2.5 w-[22px] shrink-0', className)}
      aria-hidden="true"
    >
      {DOT_LEVELS.map((level) => (
        <circle
          key={level}
          cx={4 + (level - 1) * 9}
          cy={10}
          r={3}
          fill="currentColor"
          opacity={level <= lit ? 1 : 0.25}
        />
      ))}
    </svg>
  )
}

export function PriorityIcon({
  priority,
  labelled = false,
  className,
  meterClassName,
}: {
  priority: IncidentPriority
  labelled?: boolean
  className?: string
  meterClassName?: string
}) {
  const meta = PRIORITY_BY_ID[priority]
  return (
    <span
      {...(labelled
        ? { role: 'img' as const, 'aria-label': `${meta.label} priority` }
        : { 'aria-hidden': true as const })}
      className={cn('inline-flex shrink-0', className)}
    >
      <PriorityDotMeter lit={meta.rank} className={cn(meta.tone, meterClassName)} />
    </span>
  )
}

export function StatusIcon({ status, className }: { status: IncidentStatus; className?: string }) {
  const meta = STATUS_BY_ID[status]
  const Icon = meta.icon
  return <Icon aria-hidden="true" className={cn('size-3.5 shrink-0', meta.tone, className)} />
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className="border-border bg-card text-foreground inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium">
      <StatusIcon status={status} />
      {STATUS_BY_ID[status].label}
    </span>
  )
}

export function PersonAvatar({
  person,
  decorative = false,
  roleLabel,
  className,
}: {
  person: Person | null
  decorative?: boolean
  roleLabel?: string
  className?: string
}) {
  const name = person?.name ?? 'Unassigned'
  const label = roleLabel ? `${roleLabel} · ${name}` : name
  const avatar = (
    <span
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': label, tabIndex: 0 })}
      className={cn(
        'text-2xs inline-flex size-6 shrink-0 items-center justify-center rounded-full font-semibold',
        person ? 'bg-avatar text-avatar-foreground' : 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {person ? initials(person.name) : <UserRound className="size-3.5" aria-hidden="true" />}
    </span>
  )

  if (decorative) return avatar

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
