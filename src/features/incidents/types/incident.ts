export type IncidentStatus = 'pending' | 'in_progress' | 'done'

export type IncidentPriority = 'low' | 'standard' | 'high' | 'important' | 'extremely_high'

export interface Person {
  id: string
  name: string
  /** Used to match the signed-in account to a team member. */
  email?: string
}

export interface IncidentAttachment {
  id: string
  name: string
  size: number
  type: string
  /** Missing only for legacy metadata-only rows until they are re-uploaded. */
  url?: string
}

export interface Incident {
  id: string
  title: string
  description: string
  status: IncidentStatus
  priority: IncidentPriority
  category: string
  reporter: Person
  assignee: Person | null
  client: string
  clinic: string
  clinicId: string
  /** `null` when the incident is general (not tied to one carrier). */
  carrier: string | null
  isGeneral: boolean
  rows: number[]
  executionDate: string | null
  expectedDate: string | null
  deliveredDate: string | null
  /** Required to move to Done; cleared when reopened. */
  resolution: string | null
  attachments: IncidentAttachment[]
  watcherIds: string[]
  createdAt: string
  updatedAt: string
}

export type IncidentDraft = Pick<
  Incident,
  | 'title'
  | 'description'
  | 'priority'
  | 'category'
  | 'assignee'
  | 'client'
  | 'clinic'
  | 'clinicId'
  | 'carrier'
  | 'isGeneral'
  | 'rows'
  | 'executionDate'
  | 'expectedDate'
  | 'attachments'
>

export type IncidentPatch = Partial<IncidentDraft & { resolution: string }>
