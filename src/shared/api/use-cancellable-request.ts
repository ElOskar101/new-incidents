import { useEffect, useRef, useState } from 'react'
import { isAbortError } from './api-errors'

export type RequestState<Submission, Data> =
  | { status: 'idle' }
  | { status: 'pending'; submission: Submission }
  | { status: 'success'; submission: Submission; response: Data }
  | { status: 'error'; error: unknown; submission: Submission }
  | { status: 'cancelled'; submission: Submission }

/** `RequestState` as seen by pages: a success points to the stored run instead of carrying the response. */
export type RunRequestState<Submission> =
  | Exclude<RequestState<Submission, unknown>, { status: 'success' }>
  | { status: 'success'; runId: string }

interface CancellableRequestOptions<Submission, Data> {
  /** Runs before `state` becomes `success`, only if the request was not cancelled. */
  onSuccess?: (response: Data, submission: Submission) => void
}

interface ActiveRequest<Submission> {
  submission: Submission
  controller: AbortController
}

/**
 * Runs one cancellable request at a time and exposes it as a simple state machine.
 *
 * - `start` resolves with the response, or `undefined` when the request failed, was
 *   cancelled, or another request is already running. Failures are reported through
 *   `state`, never thrown.
 * - `cancel` aborts the browser request and moves to `cancelled` immediately. The server
 *   may keep processing. A late response never changes the state or calls `onSuccess`.
 * - Unmounting aborts the active request.
 * - There are no automatic retries: expensive work is retried by the user.
 */
export function useCancellableRequest<Submission, Data>(
  send: (submission: Submission, signal: AbortSignal) => Promise<Data>,
  options: CancellableRequestOptions<Submission, Data> = {},
) {
  const [state, setState] = useState<RequestState<Submission, Data>>({ status: 'idle' })
  // Source of truth for "is a request running", readable before React re-renders.
  const active = useRef<ActiveRequest<Submission> | null>(null)

  // Unmount cleanup has no event handler alternative.
  useEffect(
    () => () => {
      active.current?.controller.abort()
      active.current = null
    },
    [],
  )

  /** True from the moment `start` is called, before React re-renders. */
  const isBusy = () => active.current !== null

  const start = async (submission: Submission): Promise<Data | undefined> => {
    if (active.current) return undefined
    const request: ActiveRequest<Submission> = { submission, controller: new AbortController() }
    active.current = request
    setState({ status: 'pending', submission })
    try {
      const response = await send(submission, request.controller.signal)
      if (active.current !== request) return undefined
      options.onSuccess?.(response, submission)
      setState({ status: 'success', submission, response })
      return response
    } catch (error) {
      if (active.current !== request) return undefined
      setState(
        isAbortError(error)
          ? { status: 'cancelled', submission }
          : { status: 'error', error, submission },
      )
      return undefined
    } finally {
      if (active.current === request) active.current = null
    }
  }

  const cancel = () => {
    const request = active.current
    if (!request) return
    active.current = null
    request.controller.abort()
    setState({ status: 'cancelled', submission: request.submission })
  }

  /** Returns to `idle`. Does nothing while a request is running. */
  const reset = () => {
    if (!active.current) setState({ status: 'idle' })
  }

  return { state, start, cancel, reset, isBusy }
}
