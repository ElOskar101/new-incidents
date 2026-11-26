import { describe, expect, it } from 'vitest'
import { createSeedIncidents } from '../../../src/features/incidents/services/seed-incidents'
import {
  EMPTY_FORM_VALUES,
  formValuesFromIncident,
  validateIncidentForm,
  type IncidentFormValues,
} from '../../../src/features/incidents/schemas/incident-form'
import { addAttachments } from '../../../src/features/incidents/utils/attachments'
import {
  formatBytes,
  formatDate,
  formatDateTime,
  formatDueDays,
  dueState,
  formatRelative,
  initials,
  parseRows,
} from '../../../src/features/incidents/utils/format'

const valid: IncidentFormValues = {
  ...EMPTY_FORM_VALUES,
  title: 'Guardian portal timeout',
  description:
    'Guardian verifications time out after ninety seconds for subscribers with many dependents.',
  priority: 'high',
  category: 'Automation error',
  client: 'Summit Pediatric Dental',
  clinicId: 'CL-4120',
  carrier: 'Guardian',
  rows: '4, 5,5, 9',
  executionDate: '2026-11-20',
  expectedDate: '2026-11-25',
  assignee: 'u-sam',
}

describe('validateIncidentForm', () => {
  it('defaults priority to Standard and requires the core fields', () => {
    expect(EMPTY_FORM_VALUES.priority).toBe('standard')
    const result = validateIncidentForm(EMPTY_FORM_VALUES)
    expect(result.success).toBe(false)
    if (result.success) return
    expect(Object.keys(result.errors).sort()).toEqual(
      ['carrier', 'category', 'client', 'description', 'title'].sort(),
    )
  })

  it('builds a normalized draft from valid values', () => {
    const result = validateIncidentForm(valid)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.draft).toMatchObject({
      clinic: 'Summit – Denver',
      rows: [4, 5, 9],
      assignee: { id: 'u-sam', name: 'Sam Ortiz' },
      carrier: 'Guardian',
      expectedDate: '2026-11-25',
    })
  })

  it('enforces description length and title max', () => {
    const short = validateIncidentForm({ ...valid, description: 'Too short' })
    expect(short.success).toBe(false)
    if (!short.success) expect(short.errors.description).toMatch(/at least 80/)

    const long = validateIncidentForm({ ...valid, title: 'x'.repeat(81) })
    expect(long.success).toBe(false)
    if (!long.success) expect(long.errors.title).toMatch(/under 80/)
  })

  it('validates clinic, rows and date order', () => {
    const result = validateIncidentForm({
      ...valid,
      clinicId: 'CL-1042',
      rows: '3, abc',
      expectedDate: '2026-11-01',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errors.clinicId).toBe('Choose a clinic.')
    expect(result.errors.rows).toMatch(/commas/)
    expect(result.errors.expectedDate).toMatch(/before the execution date/)
  })

  it('accepts General as a carrier option and maps empty strings to null', () => {
    const result = validateIncidentForm({
      ...valid,
      carrier: 'general',
      assignee: '',
      executionDate: '',
      expectedDate: '',
      rows: '',
    })
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.draft).toMatchObject({
      carrier: null,
      isGeneral: true,
      assignee: null,
      executionDate: null,
      expectedDate: null,
      rows: [],
    })
  })

  it('round-trips every mock incident through the edit form', () => {
    for (const incident of createSeedIncidents(new Date(), 'me')) {
      const result = validateIncidentForm(formValuesFromIncident(incident, false))
      expect(result.success, incident.id).toBe(true)
    }
  })
})

describe('addAttachments', () => {
  let counter = 0
  const createId = () => `id-${++counter}`

  it('accepts supported files and rejects type, duplicate and size issues', () => {
    const first = addAttachments(
      [],
      [
        { name: 'shot.PNG', size: 1000, type: 'image/png' },
        { name: 'virus.exe', size: 10, type: 'application/octet-stream' },
      ],
      createId,
    )
    expect(first.attachments.map((file) => file.name)).toEqual(['shot.PNG'])
    expect(first.errors).toEqual(['virus.exe: file type not supported.'])

    const second = addAttachments(
      first.attachments,
      [
        { name: 'shot.PNG', size: 1000, type: 'image/png' },
        { name: 'huge.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' },
        { name: 'notes.txt', size: 200, type: 'text/plain' },
      ],
      createId,
    )
    expect(second.attachments.map((file) => file.name)).toEqual(['shot.PNG', 'notes.txt'])
    expect(second.errors).toEqual([
      'shot.PNG: already attached.',
      'huge.pdf: exceeds the 6.0 MB total limit.',
    ])
  })
})

describe('format helpers', () => {
  it('parses spreadsheet rows', () => {
    expect(parseRows('')).toEqual([])
    expect(parseRows('25, 26,30')).toEqual([25, 26, 30])
    expect(parseRows('0')).toBeNull()
    expect(parseRows('1.5')).toBeNull()
  })

  it('formats dates without timezone drift', () => {
    const thisYear = new Date(2026, 10, 23)
    expect(formatDate('2026-11-01', thisYear)).toBe('Nov 1')
    expect(formatDate('2025-11-01', thisYear)).toBe('Nov 1, 2025')
    expect(formatDate(null)).toBe('—')
    expect(formatDateTime('2026-11-21T14:12:00', thisYear)).toBe('Nov 21, 2:12 PM')
    expect(formatDateTime('2025-11-21T14:12:00', thisYear)).toBe('Nov 21, 2025, 2:12 PM')
  })

  it('formats relative times', () => {
    const now = new Date('2026-11-23T12:00:00.000Z')
    expect(formatRelative('2026-11-23T11:59:40.000Z', now)).toBe('just now')
    expect(formatRelative('2026-11-23T11:30:00.000Z', now)).toMatch(/30 min/)
    expect(formatRelative('2026-11-23T09:00:00.000Z', now)).toMatch(/3 hr/)
    expect(formatRelative('2026-11-22T12:00:00.000Z', now)).toBe('yesterday')
    expect(formatRelative('2026-11-01T12:00:00.000Z', now)).toBe('Nov 1')
  })

  it('flags overdue and due-soon incidents that are not done', () => {
    const today = '2026-11-30'
    expect(dueState({ expectedDate: '2026-11-29', status: 'pending' }, today)).toBe('overdue')
    expect(dueState({ expectedDate: '2026-11-30', status: 'pending' }, today)).toBe('soon')
    expect(dueState({ expectedDate: '2026-12-01', status: 'pending' }, today)).toBe('soon')
    expect(dueState({ expectedDate: '2026-12-02', status: 'pending' }, today)).toBeNull()
    expect(dueState({ expectedDate: '2026-11-20', status: 'done' }, today)).toBeNull()
    expect(dueState({ expectedDate: null, status: 'pending' }, today)).toBeNull()
  })

  it('formats due dates as day counts', () => {
    const today = '2026-11-23'
    expect(formatDueDays('2026-11-23', today)).toBe('Today')
    expect(formatDueDays('2026-11-24', today)).toBe('Tomorrow')
    expect(formatDueDays('2026-11-26', today)).toBe('in 3 days')
    expect(formatDueDays('2026-11-22', today)).toBe('1 day overdue')
    expect(formatDueDays('2026-11-20', today)).toBe('3 days overdue')
  })

  it('formats initials and sizes', () => {
    expect(initials('Priya  Shah')).toBe('PS')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(1_572_864)).toBe('1.5 MB')
  })
})
