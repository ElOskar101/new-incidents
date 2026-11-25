import { Bell, BellRing, Copy, Hash, MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TEAM, UNASSIGNED, teamMember } from '../constants/catalog'
import { INCIDENT_PRIORITIES } from '../constants/priorities'
import { INCIDENT_STATUSES } from '../constants/statuses'
import { useIsWatching } from '../hooks/use-incidents'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useOverlayNavigation } from '../hooks/use-overlay-navigation'
import { useRequestMove } from '../hooks/use-request-move'
import type { Incident, IncidentPriority, IncidentStatus } from '../types/incident'
import { DeleteIncidentDialog } from './delete-incident-dialog'
import { PersonAvatar, PriorityIcon, StatusIcon } from './incident-badges'

function StatusOptions({ incident }: { incident: Incident }) {
  const requestMove = useRequestMove()
  return (
    <DropdownMenuRadioGroup
      value={incident.status}
      onValueChange={(status) => requestMove(incident, status as IncidentStatus)}
    >
      {INCIDENT_STATUSES.map((status) => (
        <DropdownMenuRadioItem key={status.id} value={status.id}>
          <StatusIcon status={status.id} />
          {status.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

function PriorityOptions({ incident }: { incident: Incident }) {
  const workflow = useIncidentsWorkflow()
  return (
    <DropdownMenuRadioGroup
      value={incident.priority}
      onValueChange={(priority) =>
        void workflow.updateInline(incident.id, { priority: priority as IncidentPriority })
      }
    >
      {INCIDENT_PRIORITIES.map((priority) => (
        <DropdownMenuRadioItem key={priority.id} value={priority.id}>
          <PriorityIcon priority={priority.id} />
          {priority.label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

function AssigneeOptions({ incident }: { incident: Incident }) {
  const workflow = useIncidentsWorkflow()
  return (
    <DropdownMenuRadioGroup
      value={incident.assignee?.id ?? UNASSIGNED}
      onValueChange={(id) =>
        void workflow.updateInline(incident.id, { assignee: teamMember(id) ?? null })
      }
    >
      <DropdownMenuRadioItem value={UNASSIGNED}>
        <PersonAvatar person={null} decorative className="size-5" />
        Unassigned
      </DropdownMenuRadioItem>
      {TEAM.map((person) => (
        <DropdownMenuRadioItem key={person.id} value={person.id}>
          <PersonAvatar person={person} decorative className="size-5" />
          {person.name}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

export function IncidentActionsMenu({
  incident,
  onDeleted,
  triggerClassName,
}: {
  incident: Incident
  onDeleted?: () => void
  triggerClassName?: string
}) {
  const workflow = useIncidentsWorkflow()
  const overlay = useOverlayNavigation()
  const watching = useIsWatching(incident)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${incident.title}`}
            className={cn('text-muted-foreground data-[state=open]:bg-accent', triggerClassName)}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <StatusIcon status={incident.status} />
              Move to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <StatusOptions incident={incident} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PriorityIcon priority={incident.priority} />
              Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              <PriorityOptions incident={incident} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserRound />
              Assign to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <AssigneeOptions incident={incident} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => overlay.open(`/incidents/${incident.id}/edit`)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void workflow.setWatching(incident.id, !watching)}>
            {watching ? <BellRing /> : <Bell />}
            {watching ? 'Turn off notifications' : 'Turn on notifications'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void workflow.copyLink(incident.id)}>
            <Copy />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void workflow.copyText(incident.id, 'ID')}>
            <Hash />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteIncidentDialog
        incident={incident}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => {
          void workflow.remove(incident.id).then((removed) => {
            if (removed) onDeleted?.()
          })
        }}
      />
    </>
  )
}
