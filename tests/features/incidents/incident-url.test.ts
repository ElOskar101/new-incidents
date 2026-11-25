import { afterEach, describe, expect, it, vi } from 'vitest'
import { incidentUrl } from '../../../src/features/incidents/hooks/use-incidents-workflow'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('incidentUrl', () => {
  it('builds the link under the app base path', () => {
    expect(incidentUrl('INC-1')).toBe(`${window.location.origin}/incidents/INC-1`)
    vi.stubEnv('BASE_URL', '/incidents-app/')
    expect(incidentUrl('INC-1')).toBe(`${window.location.origin}/incidents-app/incidents/INC-1`)
  })
})
