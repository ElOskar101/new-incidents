import { useParams } from 'react-router'
import { INCIDENT_TITLE_ID, IncidentForm } from '../components/incident-form'
import { IncidentFormDialog } from '../components/incident-form-dialog'
import { StatusIcon } from '../components/incident-badges'
import { IncidentNotFound } from '../components/incident-not-found'
import { useIncident, useIsWatching } from '../hooks/use-incidents'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useOverlayNavigation } from '../hooks/use-overlay-navigation'
import { formValuesFromIncident } from '../schemas/incident-form'
import type { Incident } from '../types/incident'

function EditIncident({ incident }: { incident: Incident }) {
  const workflow = useIncidentsWorkflow()
  const overlay = useOverlayNavigation()
  const watching = useIsWatching(incident)
  const detailPath = `/incidents/${incident.id}`

  const backToDetail = () => overlay.close(detailPath)

  return (
    <IncidentFormDialog
      title="Edit incident"
      leading={<StatusIcon status={incident.status} />}
      description={<span className="font-mono">{incident.id}</span>}
      caretAtEndOf={INCIDENT_TITLE_ID}
      onClose={backToDetail}
    >
      {({ requestClose, setDirty, closeAfterSave }) => (
        <IncidentForm
          initialValues={formValuesFromIncident(incident, watching)}
          submitLabel="Save changes"
          onDirtyChange={setDirty}
          onCancel={requestClose}
          onSubmit={async ({ draft, resolution, watching: watch }) => {
            const patch = resolution === undefined ? draft : { ...draft, resolution }
            const saved = await workflow.save(incident, patch, watch)
            if (!saved) return
            closeAfterSave()
          }}
        />
      )}
    </IncidentFormDialog>
  )
}

export function EditIncidentPage() {
  const { incidentId } = useParams()
  const incident = useIncident(incidentId)
  if (!incident) return <IncidentNotFound id={incidentId} />
  return <EditIncident incident={incident} />
}
