import { describe, expect, it, vi } from 'vitest'
import { createSeedIncidents } from '../../../src/features/incidents/services/seed-incidents'
import {
  createLocalIncidentsApi,
  IncidentNotFoundError,
} from '../../../src/features/incidents/services/local-incidents-api'
import type { IncidentDraft } from '../../../src/features/incidents/types/incident'
import { generateIncidentId, incidentKey } from '../../../src/features/incidents/utils/incident-id'

const NOW = new Date(2026, 10, 23, 10, 30)
const ME = { id: 'me@example.com', name: 'Me' }
const SEED = createSeedIncidents(NOW, ME.id)

const draft: IncidentDraft = {
  title: 'Aetna portal shows wrong copay',
  description: 'x'.repeat(90),
  priority: 'standard',
  category: 'Incorrect data',
  assignee: null,
  client: 'Summit Pediatric Dental',
  clinic: 'Summit – Denver',
  clinicId: 'CL-4120',
  carrier: 'Aetna',
  isGeneral: false,
  rows: [1, 2],
  executionDate: '2026-11-22',
  expectedDate: null,
  attachments: [],
}

function makeStore() {
  return createLocalIncidentsApi(SEED, { now: () => NOW })
}

describe('incident ids', () => {
  it('uses INC-YYYYMMDD-XXXXXXXX with the local date', () => {
    expect(generateIncidentId(NOW, () => 0)).toBe('INC-20261123-AAAAAAAA')
    expect(generateIncidentId(NOW)).toMatch(/^INC-20261123-[A-Z0-9]{8}$/)
    expect(incidentKey('INC-20261123-AB12CD34')).toBe('AB12CD34')
  })

  it('derives mock ids and dates from now', () => {
    const umr = SEED.find((incident) => incident.id.endsWith('3C2QS146'))!
    expect(umr.id).toBe('INC-20261121-3C2QS146')
    expect(umr.watcherIds).toEqual([ME.id])
    const shifted = createSeedIncidents(new Date(2027, 0, 10), 'x').find((incident) =>
      incident.id.endsWith('3C2QS146'),
    )!
    expect(shifted.id).toBe('INC-20270108-3C2QS146')
    expect(SEED.some((incident) => incident.id.endsWith('Z0S6LY59'))).toBe(true)
  })
})

describe('createLocalIncidentsApi', () => {
  it('creates incidents in Pending by default, first in the list, and notifies subscribers', async () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)

    const created = await store.create(draft, { reporter: ME, watcherIds: [ME.id] })

    expect(created.id).toMatch(/^INC-20261123-[A-Z0-9]{8}$/)
    expect(created).toMatchObject({ status: 'pending', reporter: ME, watcherIds: [ME.id] })
    expect(created.createdAt).toBe(NOW.toISOString())
    expect(store.getSnapshot()[0]).toBe(created)
    expect(listener).toHaveBeenCalledTimes(1)

    const quick = await store.create(draft, { reporter: ME, status: 'in_progress' })
    expect(quick.status).toBe('in_progress')
  })

  it('keeps General in sync with a null carrier', async () => {
    const store = makeStore()
    const created = await store.create({ ...draft, isGeneral: true }, { reporter: ME })
    expect(created).toMatchObject({ carrier: null, isGeneral: true })

    const asGeneral = await store.update(SEED[0]!.id, { isGeneral: true, carrier: 'UMR' }, ME)
    expect(asGeneral).toMatchObject({ carrier: null, isGeneral: true })

    const named = await store.update(asGeneral.id, { carrier: 'UMR' }, ME)
    expect(named).toMatchObject({ carrier: 'UMR', isGeneral: false })
  })

  it('retries the ID when it collides with an existing one', async () => {
    const createId = vi
      .fn()
      .mockReturnValueOnce(SEED[0]!.id)
      .mockReturnValueOnce('INC-20261123-NEWONE01')
    const store = createLocalIncidentsApi(SEED, { now: () => NOW, createId })
    expect((await store.create(draft, { reporter: ME })).id).toBe('INC-20261123-NEWONE01')
  })

  it('rejects changes to unknown incidents', async () => {
    const store = makeStore()
    await expect(store.update('missing', { title: 'x' }, ME)).rejects.toBeInstanceOf(
      IncidentNotFoundError,
    )
    await expect(store.remove('missing')).rejects.toBeInstanceOf(IncidentNotFoundError)
  })

  it('requires a resolution for Done and clears it when reopened', async () => {
    const store = makeStore()
    const id = SEED.find((incident) => incident.status === 'in_progress')!.id
    await expect(store.move(id, 'done', ME, '  ')).rejects.toThrow(/resolution/)
    expect(await store.move(id, 'done', ME, ' Fixed the parser ')).toMatchObject({
      status: 'done',
      deliveredDate: '2026-11-23',
      resolution: 'Fixed the parser',
    })
    expect(await store.move(id, 'pending', ME)).toMatchObject({
      status: 'pending',
      deliveredDate: null,
      resolution: null,
    })
  })

  it('undoes a move with an inverse patch, keeping edits made in between', async () => {
    const store = makeStore()
    const before = SEED.find((incident) => incident.status === 'done')!
    await store.move(before.id, 'pending', ME)
    await store.update(before.id, { title: 'Edited meanwhile' }, ME)
    const reverted = await store.revert(before.id, {
      status: before.status,
      deliveredDate: before.deliveredDate,
      resolution: before.resolution,
    })
    expect(reverted).toMatchObject({
      title: 'Edited meanwhile',
      status: 'done',
      deliveredDate: before.deliveredDate,
      resolution: before.resolution,
    })
  })

  it('never creates incidents directly in Done', async () => {
    const store = makeStore()
    await expect(store.create(draft, { reporter: ME, status: 'done' })).rejects.toThrow(/Done/)
    expect(store.getSnapshot()).toHaveLength(SEED.length)
  })

  it('skips the write when nothing changed', async () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)
    const incident = SEED[0]!
    const result = await store.update(incident.id, { title: incident.title }, ME)
    expect(result).toBe(incident)
    expect(listener).not.toHaveBeenCalled()
  })

  it('edits the resolution of Done incidents only, and never to empty', async () => {
    const store = makeStore()
    const done = SEED.find((incident) => incident.status === 'done')!
    const open = SEED.find((incident) => incident.status === 'pending')!
    expect((await store.update(done.id, { resolution: ' Better note ' }, ME)).resolution).toBe(
      'Better note',
    )
    await expect(store.update(done.id, { resolution: ' ' }, ME)).rejects.toThrow(/resolution/)
    expect((await store.update(open.id, { resolution: 'x', title: 'T' }, ME)).resolution).toBeNull()
  })

  it('adds and removes watchers without duplicates', async () => {
    const store = makeStore()
    const id = SEED[1]!.id
    expect((await store.setWatching(id, ME.id, true)).watcherIds).toEqual([ME.id])
    expect((await store.setWatching(id, ME.id, true)).watcherIds).toEqual([ME.id])
    expect((await store.setWatching(id, ME.id, false)).watcherIds).toEqual([])
  })

  it('removes and restores an incident', async () => {
    const store = makeStore()
    const id = SEED[2]!.id
    const removed = await store.remove(id)
    expect(store.getSnapshot().some((incident) => incident.id === id)).toBe(false)
    await store.restore(removed)
    await store.restore(removed)
    expect(store.getSnapshot().filter((incident) => incident.id === id)).toHaveLength(1)
  })

  it('can simulate latency', async () => {
    vi.useFakeTimers()
    const store = createLocalIncidentsApi(SEED, { now: () => NOW, latencyMs: 300 })
    const pending = store.update(SEED[0]!.id, { title: 'Later' }, ME)
    expect(store.getSnapshot()[0]!.title).not.toBe('Later')
    await vi.advanceTimersByTimeAsync(300)
    expect((await pending).title).toBe('Later')
    vi.useRealTimers()
  })

  it('stops notifying after unsubscribe', async () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)()
    await store.setWatching(SEED[0]!.id, ME.id, false)
    expect(listener).not.toHaveBeenCalled()
  })
})
