import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCancellableRequest } from '../../../src/shared/api'

afterEach(cleanup)

interface Submission {
  id: string
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function setup(send: (submission: Submission, signal: AbortSignal) => Promise<string>) {
  const onSuccess = vi.fn()
  const hook = renderHook(() => useCancellableRequest(send, { onSuccess }))
  return { ...hook, onSuccess }
}

describe('useCancellableRequest', () => {
  it('starts idle, shows pending immediately, and ends in success', async () => {
    const pending = deferred<string>()
    const { result, onSuccess } = setup(() => pending.promise)
    expect(result.current.state).toEqual({ status: 'idle' })
    const submission = { id: 'a' }
    let response: Promise<string | undefined>
    act(() => {
      response = result.current.start(submission)
    })
    expect(result.current.state).toEqual({ status: 'pending', submission })
    expect(result.current.isBusy()).toBe(true)
    await act(async () => {
      pending.resolve('done')
      expect(await response).toBe('done')
    })
    expect(result.current.state).toEqual({ status: 'success', submission, response: 'done' })
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith('done', submission)
    expect(result.current.isBusy()).toBe(false)
  })

  it('reports failures through state and resolves with undefined', async () => {
    const error = new Error('boom')
    const { result, onSuccess } = setup(() => Promise.reject(error))
    const submission = { id: 'a' }
    await act(async () => {
      expect(await result.current.start(submission)).toBeUndefined()
    })
    expect(result.current.state).toEqual({ status: 'error', error, submission })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('treats an abort error as a cancellation', async () => {
    const { result } = setup(() => Promise.reject(new DOMException('Aborted', 'AbortError')))
    const submission = { id: 'a' }
    await act(async () => {
      await result.current.start(submission)
    })
    expect(result.current.state).toEqual({ status: 'cancelled', submission })
  })

  it('ignores a second start while a request is running', async () => {
    const pending = deferred<string>()
    const send = vi.fn(() => pending.promise)
    const { result } = setup(send)
    act(() => {
      void result.current.start({ id: 'a' })
    })
    await act(async () => {
      expect(await result.current.start({ id: 'b' })).toBeUndefined()
    })
    await waitFor(() => expect(send).toHaveBeenCalledOnce())
  })

  it('cancels at once, aborts the signal, and ignores a late response', async () => {
    const pending = deferred<string>()
    let signal!: AbortSignal
    const { result, onSuccess } = setup((_submission, received) => {
      signal = received
      return pending.promise
    })
    const submission = { id: 'a' }
    let response: Promise<string | undefined>
    act(() => {
      response = result.current.start(submission)
    })
    await waitFor(() => expect(signal).toBeDefined())
    act(() => result.current.cancel())
    expect(signal.aborted).toBe(true)
    expect(result.current.state).toEqual({ status: 'cancelled', submission })
    expect(result.current.isBusy()).toBe(false)
    await act(async () => {
      pending.resolve('late')
      expect(await response).toBeUndefined()
    })
    expect(result.current.state).toEqual({ status: 'cancelled', submission })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('does nothing when cancelling without a running request', () => {
    const { result } = setup(() => Promise.resolve('x'))
    act(() => result.current.cancel())
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  it('reset returns to idle after a result, but not while a request runs', async () => {
    const pending = deferred<string>()
    const { result } = setup(() => pending.promise)
    act(() => {
      void result.current.start({ id: 'a' })
    })
    act(() => result.current.reset())
    expect(result.current.state.status).toBe('pending')
    await act(async () => {
      pending.resolve('done')
      await pending.promise
    })
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    act(() => result.current.reset())
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  it('never retries a failed request on its own', async () => {
    const send = vi.fn(() => Promise.reject(new Error('boom')))
    const { result } = setup(send)
    await act(async () => {
      await result.current.start({ id: 'a' })
    })
    expect(send).toHaveBeenCalledOnce()
  })
})
