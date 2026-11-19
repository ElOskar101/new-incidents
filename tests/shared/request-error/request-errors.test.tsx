import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ApiError, ApiResponseError, ApiTimeoutError } from '../../../src/shared/api'
import { RequestError } from '../../../src/shared/request-error/request-error'
import { httpRequestErrorMessage } from '../../../src/shared/request-error/request-error-message'

afterEach(cleanup)

const copy = {
  serverFailure: 'The server could not process this request. Please try again.',
  fallback: 'The request could not be completed. Please try again.',
}

describe('RequestError', () => {
  it('hides server internals behind a friendly message for 5xx errors', () => {
    const error = new ApiError(500, { detail: 'stack trace' })
    render(
      <RequestError
        error={error}
        title="Request failed"
        message={httpRequestErrorMessage(error, copy)}
        keptMessage="Your form values have been kept so you can try again."
      />,
    )
    expect(screen.getByRole('heading', { name: 'Request failed (HTTP 500)' })).toBeTruthy()
    expect(screen.getByText(copy.serverFailure)).toBeTruthy()
    expect(screen.getByText('View error details')).toBeTruthy()
  })

  it('explains upload size limits for HTTP 413', () => {
    const error = new ApiError(413, {})
    render(
      <RequestError
        error={error}
        title="Request failed"
        message={httpRequestErrorMessage(error, copy)}
        keptMessage="Your form values have been kept so you can try again."
      />,
    )
    expect(
      screen.getByText('The upload exceeded a limit enforced by the server or proxy.'),
    ).toBeTruthy()
  })

  it('shows the timeout message without an HTTP status', () => {
    const error = new ApiTimeoutError(300_000)
    render(
      <RequestError
        error={error}
        title="Request failed"
        message={httpRequestErrorMessage(error, copy)}
        keptMessage="Your form values have been kept so you can try again."
      />,
    )
    expect(screen.getByRole('heading', { name: 'Request failed' })).toBeTruthy()
    expect(screen.getByText(/did not respond within 300 seconds/)).toBeTruthy()
    expect(screen.queryByText('View error details')).toBeNull()
  })

  it('offers the payload and validation issues for contract violations', () => {
    const error = new ApiResponseError({ a: 1 }, [{ path: ['a'] }])
    render(
      <RequestError
        error={error}
        title="Request failed"
        message={httpRequestErrorMessage(error, copy)}
        keptMessage="Your form values have been kept so you can try again."
      />,
    )
    expect(screen.getByText('View error details')).toBeTruthy()
  })

  it('uses a generic message for values that are not errors', () => {
    render(
      <RequestError
        error="oops"
        title="Request failed"
        message={httpRequestErrorMessage('oops', copy)}
        keptMessage="Your form values have been kept so you can try again."
      />,
    )
    expect(screen.getByText(copy.fallback)).toBeTruthy()
  })
})
