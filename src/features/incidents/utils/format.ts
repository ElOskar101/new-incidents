export function toDateInputValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** Parses `YYYY-MM-DD` as a local date so it never shifts across timezones. */
function fromDateInputValue(value: string): Date {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatCalendar(date: Date, now: Date, withTime = false): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}

export function formatDate(value: string | null, now: Date = new Date()): string {
  return value ? formatCalendar(fromDateInputValue(value), now) : '—'
}

export function formatDateTime(iso: string, now: Date = new Date()): string {
  return formatCalendar(new Date(iso), now, true)
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diff = date.getTime() - now.getTime()
  const abs = Math.abs(diff)
  if (abs >= 7 * DAY) return formatCalendar(date, now)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })
  if (abs >= DAY) return formatter.format(Math.round(diff / DAY), 'day')
  if (abs >= HOUR) return formatter.format(Math.round(diff / HOUR), 'hour')
  if (abs >= MINUTE) return formatter.format(Math.round(diff / MINUTE), 'minute')
  return 'just now'
}

export function addDays(value: string, days: number): string {
  const date = fromDateInputValue(value)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}

export type DueState = 'overdue' | 'soon' | null

export function calendarDaysBetween(from: string, to: string): number {
  return Math.round((fromDateInputValue(to).getTime() - fromDateInputValue(from).getTime()) / DAY)
}

export function formatDueDays(value: string, today: string = toDateInputValue(new Date())): string {
  const days = calendarDaysBetween(today, value)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return '1 day overdue'
  if (days < 0) return `${Math.abs(days)} days overdue`
  return `in ${days} days`
}

/** Delivered incidents are never late. */
export function dueState(
  incident: { expectedDate: string | null; status: string },
  today: string,
): DueState {
  if (incident.status === 'done' || incident.expectedDate === null) return null
  if (incident.expectedDate < today) return 'overdue'
  if (incident.expectedDate <= addDays(today, 1)) return 'soon'
  return null
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatRows(rows: readonly number[]): string {
  return rows.join(', ')
}

/** Returns `null` when any entry is not a positive integer. */
export function parseRows(text: string): number[] | null {
  const parts = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const rows: number[] = []
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null
    const row = Number(part)
    if (row < 1) return null
    if (!rows.includes(row)) rows.push(row)
  }
  return rows
}
