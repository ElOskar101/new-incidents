import { describe, expect, it } from 'vitest'
import { resolveCurrentUser } from '../../../src/features/incidents/constants/catalog'

describe('resolveCurrentUser', () => {
  it('matches the signed-in account to its team member by email', () => {
    expect(resolveCurrentUser({ name: 'Priya S.', email: 'Priya.Shah@example.dev' })).toEqual({
      id: 'u-priya',
      name: 'Priya Shah',
      email: 'priya.shah@example.dev',
    })
  })

  it('falls back to a person built from the profile', () => {
    expect(resolveCurrentUser({ name: 'Guest', email: 'guest@example.com' })).toEqual({
      id: 'guest@example.com',
      name: 'Guest',
      email: 'guest@example.com',
    })
    expect(resolveCurrentUser({ name: null, email: null })).toEqual({ id: 'me', name: 'You' })
  })
})
