import { z } from 'zod'

const codeMessages: Record<string, string> = {}

// Documented in the backend OpenAPI spec (`HTTPValidationError`), sent with HTTP 422.
const validationIssueSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
})

// Not documented in the OpenAPI spec: shape observed in backend responses.
const errorObjectSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  document_id: z.string().optional(),
})

const errorPayloadSchema = z.object({
  detail: z.union([z.string(), z.array(validationIssueSchema), errorObjectSchema]).optional(),
  // Set by the client when the body is not JSON (for example, a proxy HTML page).
  message: z.string().optional(),
})

/** FastAPI `detail`: a message or code, field validation issues, or an error object. */
export type ApiErrorDetail = NonNullable<z.infer<typeof errorPayloadSchema>['detail']>

function detailMessages(detail: ApiErrorDetail): string[] {
  if (typeof detail === 'string') return [codeMessages[detail] ?? detail]
  if (Array.isArray(detail)) {
    return detail.map(({ loc, msg }) => (loc.length ? `${loc.join('.')}: ${msg}` : msg))
  }
  const known = detail.code ? codeMessages[detail.code] : undefined
  const message = known ?? detail.message ?? detail.code
  if (!message) return []
  return [detail.document_id ? `${detail.document_id}: ${message}` : message]
}

export class ApiError extends Error {
  readonly status: number
  /** Raw response body, kept for diagnostics. */
  readonly payload: unknown
  /** Typed `detail`, or `undefined` when the body has an unknown shape. */
  readonly detail: ApiErrorDetail | undefined
  readonly messages: string[]

  constructor(status: number, payload: unknown) {
    // A bare JSON string body is treated as the `detail`.
    const normalized = typeof payload === 'string' ? { detail: payload } : payload
    const parsed = errorPayloadSchema.safeParse(normalized)
    const body = parsed.success ? parsed.data : {}
    const fallback = body.message ? [body.message] : []
    const messages = body.detail ? detailMessages(body.detail) : fallback
    super(messages.length ? messages.join('\n') : `The API returned HTTP ${status}.`)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
    this.detail = body.detail
    this.messages = messages
  }
}

export class ApiNetworkError extends Error {
  constructor(cause: unknown) {
    super('Could not connect to the server. Check your connection and try again.', { cause })
    this.name = 'ApiNetworkError'
  }
}

export class ApiTimeoutError extends Error {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super(`The server did not respond within ${Math.round(timeoutMs / 1000)} seconds. Try again.`)
    this.name = 'ApiTimeoutError'
    this.timeoutMs = timeoutMs
  }
}

export class ApiResponseError extends Error {
  readonly payload: unknown
  readonly issues: unknown

  constructor(payload: unknown, issues: unknown) {
    super('The server returned a response that does not match the expected contract.')
    this.name = 'ApiResponseError'
    this.payload = payload
    this.issues = issues
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  )
}
