// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

async function loadConfig(env: { mode: string; baseUrl?: string }) {
  vi.resetModules()
  vi.stubEnv('MODE', env.mode)
  if (env.baseUrl !== undefined) vi.stubEnv('VITE_API_BASE_URL', env.baseUrl)
  return (await import('../../../src/shared/api/config')).config
}

describe('api config', () => {
  it('uses the proxy (relative URLs) in development', async () => {
    const config = await loadConfig({ mode: 'development', baseUrl: 'https://api.example.com' })
    expect(config.API_URL).toBe('')
    expect(config.ENDPOINTS.health).toBe('/api/health')
  })

  it.each(['production', 'test'])('calls the configured backend directly in %s', async (mode) => {
    const config = await loadConfig({ mode, baseUrl: 'https://api.example.com' })
    expect(config.API_URL).toBe('https://api.example.com')
    expect(config.ENDPOINTS.health).toBe('https://api.example.com/api/health')
  })

  it('removes trailing slashes from the backend URL', async () => {
    const config = await loadConfig({ mode: 'production', baseUrl: 'https://api.example.com//' })
    expect(config.BACKEND_URL).toBe('https://api.example.com')
  })

  it('keeps uploads on a longer timeout than regular requests', async () => {
    const config = await loadConfig({ mode: 'production', baseUrl: 'https://api.example.com' })
    expect(config.REQUEST_TIMEOUT_MS.upload).toBeGreaterThan(config.REQUEST_TIMEOUT_MS.default)
  })
})
