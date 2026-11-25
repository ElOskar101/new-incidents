import { safeParse, type core } from 'zod/mini'
import { config } from './config'
import {
  ApiError,
  ApiNetworkError,
  ApiResponseError,
  ApiTimeoutError,
  isAbortError,
} from './api-errors'

export interface RequestOptions {
  body?: FormData | string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  signal?: AbortSignal
  timeoutMs?: number
  headers?: Record<string, string>
}

export async function requestJson<T>(
  url: string,
  schema: core.$ZodType<T>,
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

  const result = safeParse(schema, payload)
  if (!result.success) throw new ApiResponseError(payload, result.error.issues)
  return result.data
}
