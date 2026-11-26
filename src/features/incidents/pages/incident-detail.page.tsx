import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Sheet, SheetContent } from '@/shared/ui/sheet'
import { DeleteIncidentDialog } from '../components/delete-incident-dialog'
import { IncidentDetailBody } from '../components/incident-detail-body'
import { IncidentDetailHeader } from '../components/incident-detail-header'
import { IncidentNotFound } from '../components/incident-not-found'
import { useIncident } from '../hooks/use-incidents'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useOverlayNavigation } from '../hooks/use-overlay-navigation'
import type { Incident } from '../types/incident'

function IncidentDetail({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const workflow = useIncidentsWorkflow()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const editPath = `/incidents/${incident.id}/edit`

  return (
    <SheetContent
      showCloseButton={false}
      side="center"
      className="gap-0 sm:max-w-6xl"
      onOpenAutoFocus={(event) => {
        // Radix would focus the first header button (Copy ID), where Enter copies.
        event.preventDefault()
        titleRef.current?.focus()
      }}
    >
      <IncidentDetailHeader
        incident={incident}
        editPath={editPath}
        onDelete={() => setConfirmDelete(true)}
      />

      <IncidentDetailBody incident={incident} titleRef={titleRef} />

      <DeleteIncidentDialog
        incident={incident}
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => {
          onClose()
          void workflow.remove(incident.id)
        }}
      />
    </SheetContent>
  )
}

export function IncidentDetailPage() {
  const { incidentId } = useParams()
  const incident = useIncident(incidentId)
  const overlay = useOverlayNavigation()
  /** Set when closing after a delete, so the gone incident does not flash "not found". */
  const [leaving, setLeaving] = useState(false)
  const close = () => {
    setLeaving(true)
    overlay.close()
  }

  if (!incident) return leaving ? null : <IncidentNotFound id={incidentId} />

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <IncidentDetail incident={incident} onClose={close} />
    </Sheet>
  )
}
