export const loadIncidentDetailPage = () => import('./incident-detail.page')
export const loadCreateIncidentPage = () => import('./create-incident.page')
export const loadEditIncidentPage = () => import('./edit-incident.page')

export function preload(load: () => Promise<unknown>): void {
  load().catch(() => undefined)
}
