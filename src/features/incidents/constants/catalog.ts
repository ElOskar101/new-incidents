import type { Person } from '../types/incident'

export interface Clinic {
  id: string
  name: string
}

export interface Client {
  name: string
  clinics: readonly Clinic[]
}

export const CLIENTS: readonly Client[] = [
  {
    name: 'Bright Smile Dental Group',
    clinics: [
      { id: 'CL-1042', name: 'Bright Smile – Austin' },
      { id: 'CL-1043', name: 'Bright Smile – Round Rock' },
    ],
  },
  {
    name: 'Harbor Orthodontics',
    clinics: [
      { id: 'CL-3307', name: 'Harbor Ortho – San Diego' },
      { id: 'CL-3308', name: 'Harbor Ortho – La Jolla' },
    ],
  },
  {
    name: 'Lakeside Dental Partners',
    clinics: [
      { id: 'CL-5501', name: 'Lakeside – Chicago Loop' },
      { id: 'CL-5502', name: 'Lakeside – Evanston' },
    ],
  },
  {
    name: 'Northwind Family Dentistry',
    clinics: [{ id: 'CL-2210', name: 'Northwind – Seattle' }],
  },
  {
    name: 'Summit Pediatric Dental',
    clinics: [{ id: 'CL-4120', name: 'Summit – Denver' }],
  },
  {
    name: 'Care Dentistry Group',
    clinics: [{ id: '6adc634ce5a29b5b07f50937', name: 'Dentist Of Bixby Knolls' }],
  },
]

export const CARRIERS: readonly string[] = [
  'Aetna',
  'Cigna',
  'Delta Dental',
  'Guardian',
  'Humana',
  'MetLife',
  'Premera Availity',
  'UMR',
  'United Concordia',
]

export const TEAM: readonly Person[] = [
  { id: 'u-alex', name: 'Alex Rivera', email: 'alex.rivera@example.dev' },
  { id: 'u-casey', name: 'Casey Nguyen', email: 'casey.nguyen@example.dev' },
  { id: 'u-edwin', name: 'Edwin', email: 'edwin@example.dev' },
  { id: 'u-jonathan', name: 'Jonathan', email: 'jonathan@example.dev' },
  { id: 'u-jordan', name: 'Jordan Lee', email: 'jordan.lee@example.dev' },
  { id: 'u-morgan', name: 'Morgan Blake', email: 'morgan.blake@example.dev' },
  { id: 'u-priya', name: 'Priya Shah', email: 'priya.shah@example.dev' },
  { id: 'u-sam', name: 'Sam Ortiz', email: 'sam.ortiz@example.dev' },
]

export function teamMember(id: string): Person | undefined {
  return TEAM.find((person) => person.id === id)
}

/**
 * The signed-in account as a team member (matched by email), so watching and assignee match the
 * same id. Accounts outside the team get a person built from the profile.
 */
export function resolveCurrentUser(profile: { name: string | null; email: string | null }): Person {
  const email = profile.email?.trim().toLowerCase()
  const member = email ? TEAM.find((person) => person.email === email) : undefined
  if (member) return member
  return {
    id: email ?? profile.name ?? 'me',
    name: profile.name ?? profile.email ?? 'You',
    ...(email ? { email } : {}),
  }
}

export const UNASSIGNED = 'unassigned'
export const GENERAL_CARRIER = 'general'

export const CATEGORIES: readonly string[] = [
  'Empty form',
  'Missing data',
  'Incorrect data',
  'Eligibility',
  'Claim status',
  'Portal access',
  'Automation error',
  'Other',
]

export const ATTACHMENT_EXTENSIONS: readonly string[] = ['png', 'jpg', 'jpeg', 'txt', 'pdf', 'docx']

export const MAX_ATTACHMENTS_BYTES = 6 * 1024 * 1024

export const DONE_RECENT_DAYS = 14

export const TITLE_MAX = 80
export const DESCRIPTION_MIN = 80
export const DESCRIPTION_MAX = 1000
export const RESOLUTION_MAX = 500

export function clinicsFor(clientName: string): readonly Clinic[] {
  return CLIENTS.find((client) => client.name === clientName)?.clinics ?? []
}
