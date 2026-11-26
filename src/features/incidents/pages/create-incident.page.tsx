import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { STATUS_BY_ID } from '../constants/statuses'
import { IncidentForm } from '../components/incident-form'
import { IncidentFormDialog } from '../components/incident-form-dialog'
import { StatusIcon } from '../components/incident-badges'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { useOverlayNavigation, type OverlayState } from '../hooks/use-overlay-navigation'
import { EMPTY_FORM_VALUES } from '../schemas/incident-form'

export function CreateIncidentPage() {
  const workflow = useIncidentsWorkflow()
  const navigate = useNavigate()
  const overlay = useOverlayNavigation()
  const requested = overlay.state.status
  const status = requested && requested !== 'done' ? requested : 'pending'

  return (
    <IncidentFormDialog
      title="New incident"
      description={`Starts in ${STATUS_BY_ID[status].label}.`}
      leading={<StatusIcon status={status} />}
      onClose={() => overlay.close()}
    >
      {({ requestClose, setDirty, closeAfterSave }) => (
        <IncidentForm
          initialValues={EMPTY_FORM_VALUES}
          submitLabel="Create incident"
          onDirtyChange={setDirty}
          onCancel={requestClose}
          onSubmit={async ({ draft, watching }) => {
            const incident = await workflow.create(draft, { watch: watching, status })
            if (!incident) return
            toast.success('Incident created', {
              description: incident.title,
              action: {
                label: 'View',
                onClick: () =>
                  void navigate(overlay.to(`/incidents/${incident.id}`), {
                    state: { canGoBack: true } satisfies OverlayState,
                  }),
              },
            })
            closeAfterSave()
          }}
        />
      )}
    </IncidentFormDialog>
  )
}
