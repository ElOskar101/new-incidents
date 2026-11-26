import type {
  Incident,
  IncidentDraft,
  IncidentPatch,
  IncidentStatus,
  Person,
} from '../types/incident'
import { generateIncidentId } from '../utils/incident-id'
import { toDateInputValue } from '../utils/format'

export class IncidentNotFoundError extends Error {
  constructor(id: string) {
    super(`Incident ${id} was not found.`)
    this.name = 'IncidentNotFoundError'
  }
}

export interface CreateIncidentOptions {
  reporter: Person
  status?: IncidentStatus
  watcherIds?: string[]
}

export type IncidentRevert = Partial<
  Pick<Incident, 'status' | 'deliveredDate' | 'resolution' | 'priority' | 'assignee' | 'watcherIds'>
>

export interface IncidentsApi {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => readonly Incident[]
  create: (draft: IncidentDraft, options: CreateIncidentOptions) => Promise<Incident>
  update: (id: string, patch: IncidentPatch, actor: Person) => Promise<Incident>
  move: (
    id: string,
    status: IncidentStatus,
    actor: Person,
    resolution?: string,
  ) => Promise<Incident>
  revert: (id: string, fields: IncidentRevert) => Promise<Incident>
  setWatching: (id: string, userId: string, watching: boolean) => Promise<Incident>
  remove: (id: string) => Promise<Incident>
  restore: (incident: Incident) => Promise<void>
}

export interface IncidentsApiOptions {
  now?: () => Date
  createId?: (now: Date) => string
  latencyMs?: number
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function hasChanges(before: Incident, after: Incident): boolean {
  return (Object.keys(after) as (keyof Incident)[]).some((key) => !same(before[key], after[key]))
}

/** Single source of truth: General ⇔ `carrier === null`. */
function normalizeGeneral(
  fields: Pick<Incident, 'carrier' | 'isGeneral'>,
): Pick<Incident, 'carrier' | 'isGeneral'> {
  const isGeneral = fields.isGeneral || fields.carrier === null
  return { isGeneral, carrier: isGeneral ? null : fields.carrier }
}

function applyGeneralPatch(current: Incident, change: Partial<Incident>): Partial<Incident> {
  if (change.isGeneral === undefined && change.carrier === undefined) return change
  // Explicit General wins even if a stale carrier string is still in the patch.
  if (change.isGeneral === true) {
    return { ...change, isGeneral: true, carrier: null }
  }
  if (change.carrier !== undefined) {
    return { ...change, isGeneral: change.carrier === null, carrier: change.carrier }
  }
  // isGeneral: false without a new carrier — only valid when one already exists.
  if (current.carrier === null) {
    return { ...change, isGeneral: true, carrier: null }
  }
  return { ...change, isGeneral: false }
}

export function createLocalIncidentsApi(
  seed: readonly Incident[],
  {
    now = () => new Date(),
    createId = (date) => generateIncidentId(date),
    latencyMs = 0,
  }: IncidentsApiOptions = {},
): IncidentsApi {
  let incidents: readonly Incident[] = seed
  const listeners = new Set<() => void>()

  const settle = () =>
    latencyMs > 0 ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : Promise.resolve()

  const commit = (next: readonly Incident[]) => {
    incidents = next
    for (const listener of listeners) listener()
  }

  const find = (id: string): Incident => {
    const incident = incidents.find((current) => current.id === id)
    if (!incident) throw new IncidentNotFoundError(id)
    return incident
  }

  const mutate = async (
    id: string,
    change: (incident: Incident) => Partial<Incident>,
  ): Promise<Incident> => {
    await settle()
    const current = find(id)
    const next: Incident = { ...current, ...change(current) }
    if (!hasChanges(current, next)) return current
    const updated: Incident = { ...next, updatedAt: now().toISOString() }
    commit(incidents.map((incident) => (incident.id === id ? updated : incident)))
    return updated
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => incidents,
    async create(draft, { reporter, status = 'pending', watcherIds = [] }) {
      await settle()
      if (status === 'done') throw new Error('New incidents cannot start in Done.')
      const date = now()
      let id = createId(date)
      while (incidents.some((incident) => incident.id === id)) id = createId(date)
      const timestamp = date.toISOString()
      const incident: Incident = {
        ...draft,
        ...normalizeGeneral(draft),
        id,
        status,
        reporter,
        watcherIds,
        deliveredDate: null,
        resolution: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      commit([incident, ...incidents])
      return incident
    },
    update: (id, { resolution, ...change }) =>
      mutate(id, (incident) => {
        const next = applyGeneralPatch(incident, change)
        if (resolution === undefined || incident.status !== 'done') return next
        const note = resolution.trim()
        if (!note) throw new Error('Done incidents need a resolution.')
        return { ...next, resolution: note }
      }),
    move: (id, status, _actor, resolution) =>
      mutate(id, (incident) => {
        if (incident.status === status) return {}
        if (status !== 'done') return { status, deliveredDate: null, resolution: null }
        const note = resolution?.trim()
        if (!note) throw new Error('A resolution is required to move an incident to Done.')
        return { status, deliveredDate: toDateInputValue(now()), resolution: note }
      }),
    revert: (id, fields) => mutate(id, () => fields),
    setWatching: (id, userId, watching) =>
      mutate(id, (incident) => ({
        watcherIds: watching
          ? [...new Set([...incident.watcherIds, userId])]
          : incident.watcherIds.filter((watcher) => watcher !== userId),
      })),
    async remove(id) {
      await settle()
      const removed = find(id)
      commit(incidents.filter((incident) => incident.id !== id))
      return removed
    },
    async restore(incident) {
      await settle()
      if (incidents.some((current) => current.id === incident.id)) return
      commit([incident, ...incidents])
    },
  }
}
