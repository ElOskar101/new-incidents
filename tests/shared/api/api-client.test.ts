// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { requestJson } from '../../../src/shared/api/api-client'
import { ApiError, ApiTimeoutError } from '../../../src/shared/api/api-errors'

const schema = z.object({ status: z.literal('ok') })
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** A fetch that never answers and rejects when its signal aborts, like the real one. */
function hangingFetch() {
  return vi.fn(
    (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(init.signal?.reason as Error)
        })
      }),
  )
}

describe('request timeout', () => {
  it('throws ApiTimeoutError when the server does not answer in time', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    const request = requestJson('/health', schema, { timeoutMs: 1000 })
    const assertion = expect(request).rejects.toMatchObject({ name: 'ApiTimeoutError' })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })

  it('reports the configured wait in the message', () => {
    expect(new ApiTimeoutError(30_000).message).toContain('30 seconds')
  })

  it('keeps a caller abort as an abort error, not a timeout', async () => {
    vi.stubGlobal('fetch', hangingFetch())
    const controller = new AbortController()
    const request = requestJson('/health', schema, { timeoutMs: 60_000, signal: controller.signal })
    const assertion = expect(request).rejects.not.toBeInstanceOf(ApiTimeoutError)
    controller.abort()
    await assertion
  })
})

describe('retries', () => {
  it('never retries a failed request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ detail: 'down' }, 503))
    vi.stubGlobal('fetch', fetchMock)
    await expect(requestJson('/health', schema)).rejects.toBeInstanceOf(ApiError)
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
