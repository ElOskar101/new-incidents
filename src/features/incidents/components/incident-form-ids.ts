import type { IncidentFormField } from '../schemas/incident-form'

/** Visual order, used to focus the first invalid field on submit. */
export const FIELD_ORDER: readonly IncidentFormField[] = [
  'title',
  'description',
  'priority',
  'category',
  'resolution',
  'client',
  'clinicId',
  'carrier',
  'executionDate',
  'rows',
  'assignee',
  'expectedDate',
]

export const fieldId = (field: IncidentFormField) => `incident-${field}`

export const INCIDENT_TITLE_ID = fieldId('title')

export const SECTION_TITLE = 'text-muted-foreground text-xs font-semibold uppercase'
