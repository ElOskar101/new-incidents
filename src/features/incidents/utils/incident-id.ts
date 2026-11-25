import { toDateInputValue } from './format'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
const SUFFIX_LENGTH = 8

export function generateIncidentId(date: Date, random: () => number = Math.random): string {
  let suffix = ''
  for (let index = 0; index < SUFFIX_LENGTH; index += 1) {
    suffix += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? 'X'
  }
  return `INC-${toDateInputValue(date).replaceAll('-', '')}-${suffix}`
}

export function incidentKey(id: string): string {
  return id.slice(-SUFFIX_LENGTH)
}
