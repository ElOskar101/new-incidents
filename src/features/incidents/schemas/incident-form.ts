import { z } from 'zod'
import {
  CATEGORIES,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  GENERAL_CARRIER,
  RESOLUTION_MAX,
  TITLE_MAX,
  clinicsFor,
  teamMember,
} from '../constants/catalog'
import type {
  Incident,
  IncidentAttachment,
  IncidentDraft,
  IncidentPriority,
} from '../types/incident'
import { formatRows, parseRows } from '../utils/format'

export interface IncidentFormValues {
  title: string
  description: string
  priority: IncidentPriority
  category: string
  client: string
  clinicId: string
  carrier: string
  executionDate: string
  rows: string
  expectedDate: string
  assignee: string
  attachments: IncidentAttachment[]
  watching: boolean
  resolution: string | null
}

export type IncidentFormField = keyof IncidentFormValues
export type IncidentFormErrors = Partial<Record<IncidentFormField, string>>

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().optional(),
})

export const incidentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Add a short title.')
    .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters.`),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Describe the problem in at least ${DESCRIPTION_MIN} characters.`)
    .max(DESCRIPTION_MAX, `Keep the description under ${DESCRIPTION_MAX} characters.`),
  priority: z.enum(['low', 'standard', 'high', 'important', 'extremely_high'], {
    error: 'Choose a priority.',
  }),
  category: z.enum(CATEGORIES as [string, ...string[]], { error: 'Choose a category.' }),
  client: z.string().min(1, 'Choose a client.'),
  clinicId: z.string(),
  carrier: z.string(),
  executionDate: z.string(),
  rows: z.string(),
  expectedDate: z.string(),
  assignee: z.string(),
  attachments: z.array(attachmentSchema),
  watching: z.boolean(),
  resolution: z.string().nullable(),
})

function crossFieldErrors(values: IncidentFormValues): IncidentFormErrors {
  const errors: IncidentFormErrors = {}
  if (values.client && !clinicsFor(values.client).some((c) => c.id === values.clinicId)) {
    errors.clinicId = 'Choose a clinic.'
  }
  if (!values.carrier) {
    errors.carrier = 'Choose a carrier.'
  }
  if (parseRows(values.rows) === null) {
    errors.rows = 'Use row numbers separated by commas, e.g. 25, 26, 30.'
  }
  if (values.executionDate && values.expectedDate && values.expectedDate < values.executionDate) {
    errors.expectedDate = 'Expected date cannot be before the execution date.'
  }
  if (values.resolution !== null) {
    const length = values.resolution.trim().length
    if (length === 0) errors.resolution = 'Describe how the incident was resolved.'
    else if (length > RESOLUTION_MAX) {
      errors.resolution = `Keep the resolution under ${RESOLUTION_MAX} characters.`
    }
  }
  return errors
}

export type IncidentFormResult =
  | { success: true; draft: IncidentDraft; resolution?: string; watching: boolean }
  | { success: false; errors: IncidentFormErrors }

export function validateIncidentForm(values: IncidentFormValues): IncidentFormResult {
  const parsed = incidentFormSchema.safeParse(values)
  const errors = crossFieldErrors(values)
  for (const issue of parsed.error?.issues ?? []) {
    const field = issue.path[0] as IncidentFormField | undefined
    if (field) errors[field] ??= issue.message
  }
  if (!parsed.success || Object.keys(errors).length > 0) return { success: false, errors }
  const data = parsed.data
  const clinic = clinicsFor(data.client).find((c) => c.id === data.clinicId)
  return {
    success: true,
    draft: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      assignee: teamMember(data.assignee) ?? null,
      client: data.client,
      clinic: clinic?.name ?? '',
      clinicId: data.clinicId,
      carrier: data.carrier === GENERAL_CARRIER ? null : data.carrier,
      isGeneral: data.carrier === GENERAL_CARRIER,
      rows: parseRows(data.rows) ?? [],
      executionDate: data.executionDate || null,
      expectedDate: data.expectedDate || null,
      attachments: data.attachments,
    },
    ...(data.resolution === null ? {} : { resolution: data.resolution.trim() }),
    watching: data.watching,
  }
}

export const EMPTY_FORM_VALUES: IncidentFormValues = {
  title: '',
  description: '',
  priority: 'standard',
  category: '',
  client: '',
  clinicId: '',
  carrier: '',
  executionDate: '',
  rows: '',
  expectedDate: '',
  assignee: '',
  attachments: [],
  watching: true,
  resolution: null,
}

export function formValuesFromIncident(incident: Incident, watching: boolean): IncidentFormValues {
  return {
    title: incident.title,
    description: incident.description,
    priority: incident.priority,
    category: incident.category,
    client: incident.client,
    clinicId: incident.clinicId,
    carrier: incident.isGeneral || incident.carrier === null ? GENERAL_CARRIER : incident.carrier,
    executionDate: incident.executionDate ?? '',
    rows: formatRows(incident.rows),
    expectedDate: incident.expectedDate ?? '',
    assignee: incident.assignee?.id ?? '',
    attachments: incident.attachments,
    watching,
    resolution: incident.status === 'done' ? (incident.resolution ?? '') : null,
  }
}
