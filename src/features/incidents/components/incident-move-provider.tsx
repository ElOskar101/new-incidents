import { useCallback, useState, type ReactNode } from 'react'
import { useIncidentsWorkflow } from '../hooks/use-incidents-workflow'
import { RequestMoveContext, type MoveOptions, type RequestMove } from '../hooks/use-request-move'
import type { Incident } from '../types/incident'
import { ResolveIncidentDialog } from './resolve-incident-dialog'

export function IncidentMoveProvider({ children }: { children: ReactNode }) {
  const workflow = useIncidentsWorkflow()
  const [resolving, setResolving] = useState<{ incident: Incident; options: MoveOptions } | null>(
    null,
  )

  const requestMove = useCallback<RequestMove>(
    (incident, status, options = {}) => {
      if (incident.status === status) return
      if (status === 'done') setResolving({ incident, options })
      else void workflow.move(incident, status, options)
    },
    [workflow],
  )

  return (
    <RequestMoveContext.Provider value={requestMove}>
      {children}
      {resolving ? (
        <ResolveIncidentDialog
          incident={resolving.incident}
          onCancel={() => setResolving(null)}
          onConfirm={async (resolution) => {
            const moved = await workflow.move(resolving.incident, 'done', {
              ...resolving.options,
              resolution,
            })
            if (moved) setResolving(null)
          }}
        />
      ) : null}
    </RequestMoveContext.Provider>
  )
}
