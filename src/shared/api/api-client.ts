import type { z } from 'zod'
import { config } from './config'
import {
  ApiError,
  ApiNetworkError,
  ApiResponseError,
  ApiTimeoutError,
  isAbortError,
} from './api-errors'

export interface RequestOptions {
  /** Request body. FormData for multipart uploads; string for JSON (`JSON.stringify`). */
  body?: FormData | string
  /** Defaults to POST when `body` is set, otherwise GET. */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Cancels the request. The abort error is rethrown as is. */
  signal?: AbortSignal
  /** Total time for the request, including reading the body. Throws `ApiTimeoutError`. */
  timeoutMs?: number
  /** Extra request headers. `Accept: application/json` is always set. */
  headers?: Record<string, string>
}

/**
 * Sends one request (no retries) and validates the JSON response with `schema`.
 *
 * Throws `ApiNetworkError`, `ApiTimeoutError`, `ApiError` (non-2xx), or
 * `ApiResponseError` (invalid payload). Abort errors from `options.signal` pass through.
 */
export async function requestJson<T>(
  url: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? config.REQUEST_TIMEOUT_MS.default
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal
  const method = options.method ?? (options.body !== undefined ? 'POST' : 'GET')

  let response: Response
  let raw: string
  try {
    response = await fetch(url, {
      method,
      headers: { Accept: 'application/json', ...options.headers },
      body: options.body,
      signal,
    })
    raw = await response.text()
  } catch (error) {
    if (options.signal?.aborted) throw error
    if (timeoutSignal.aborted) throw new ApiTimeoutError(timeoutMs)
    if (isAbortError(error)) throw error
    throw new ApiNetworkError(error)
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    payload = { message: raw || response.statusText }
  }
  if (!response.ok) throw new ApiError(response.status, payload)

  const result = schema.safeParse(payload)
  if (!result.success) throw new ApiResponseError(payload, result.error.issues)
  return result.data
}
