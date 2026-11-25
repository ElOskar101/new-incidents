import { useMemo } from 'react'
import { toast } from 'sonner'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { STATUS_BY_ID } from '../constants/statuses'
import type { Incident, IncidentDraft, IncidentPatch, IncidentStatus } from '../types/incident'
import { useIncidentsContext } from './use-incidents'

export function incidentUrl(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}/incidents/${id}`
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.'
}

async function attempt<T>(title: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run()
  } catch (error) {
    toast.error(title, { description: errorMessage(error) })
    return null
  }
}

export function useIncidentsWorkflow() {
  const { api, currentUser } = useIncidentsContext()

  return useMemo(
    () => ({
      create: (
        draft: IncidentDraft,
        { watch, status }: { watch: boolean; status?: IncidentStatus },
      ) =>
        attempt('Could not create the incident', () =>
          api.create(draft, {
            reporter: currentUser,
            status,
            watcherIds: watch ? [currentUser.id] : [],
          }),
        ),

      save: (incident: Incident, patch: IncidentPatch, watch: boolean) =>
        attempt('Could not save changes', async () => {
          const updated = await api.update(incident.id, patch, currentUser)
          const watching = updated.watcherIds.includes(currentUser.id)
          const result =
            watching === watch ? updated : await api.setWatching(incident.id, currentUser.id, watch)
          toast.success('Changes saved')
          return result
        }),

      updateInline: (id: string, patch: IncidentPatch) =>
        attempt('Could not update the incident', () => api.update(id, patch, currentUser)),

      move: (
        incident: Incident,
        status: IncidentStatus,
        { resolution, notify = true }: { resolution?: string; notify?: boolean } = {},
      ) =>
        attempt('Could not move the incident', async () => {
          if (incident.status === status) return incident
          const moved = await api.move(incident.id, status, currentUser, resolution)
          if (notify) {
            const { status: previous, deliveredDate, resolution: note } = incident
            // One undo per incident: a newer move replaces the older toast instead of stacking.
            toast.success(`Moved to ${STATUS_BY_ID[status].label}`, {
              id: `move-${incident.id}`,
              description: incident.title,
              action: {
                label: 'Undo',
                onClick: () =>
                  void attempt('Could not undo', () =>
                    api.revert(incident.id, {
                      status: previous,
                      deliveredDate,
                      resolution: note,
                    }),
                  ),
              },
            })
          }
          return moved
        }),

      setWatching: (id: string, watching: boolean) =>
        attempt('Could not update notifications', () =>
          api.setWatching(id, currentUser.id, watching),
        ),

      remove: (id: string) =>
        attempt('Could not delete the incident', async () => {
          const removed = await api.remove(id)
          toast('Incident deleted', {
            description: removed.title,
            action: {
              label: 'Undo',
              onClick: () => void attempt('Could not undo', () => api.restore(removed)),
            },
          })
          return removed
        }),

      requestResult: (incident: Incident) => {
        toast.success('Result request sent', { description: incident.title })
      },

      async copyLink(id: string) {
        if (await copyToClipboard(incidentUrl(id))) toast.success('Link copied')
        else toast.error('Could not copy the link')
      },

      async copyText(text: string, label: string) {
        if (await copyToClipboard(text)) toast.success(`${label} copied`, { description: text })
        else toast.error(`Could not copy the ${label.toLowerCase()}`)
      },
    }),
    [api, currentUser],
  )
}
