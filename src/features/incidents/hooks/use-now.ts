import { useCallback, useSyncExternalStore } from 'react'

interface Ticker {
  now: number
  listeners: Set<() => void>
  timer: number | undefined
}

/** One shared interval per period, however many components read the clock. */
const tickers = new Map<number, Ticker>()

function tickerFor(intervalMs: number): Ticker {
  let ticker = tickers.get(intervalMs)
  if (!ticker) {
    ticker = { now: Date.now(), listeners: new Set(), timer: undefined }
    tickers.set(intervalMs, ticker)
  }
  return ticker
}

function subscribeTo(intervalMs: number, listener: () => void) {
  const ticker = tickerFor(intervalMs)
  ticker.listeners.add(listener)
  if (ticker.timer === undefined) {
    ticker.now = Date.now()
    ticker.timer = window.setInterval(() => {
      ticker.now = Date.now()
      for (const notify of ticker.listeners) notify()
    }, intervalMs)
  }
  return () => {
    ticker.listeners.delete(listener)
    if (ticker.listeners.size === 0) {
      window.clearInterval(ticker.timer)
      ticker.timer = undefined
    }
  }
}

export function useNow(intervalMs = 60_000): number {
  const subscribe = useCallback(
    (listener: () => void) => subscribeTo(intervalMs, listener),
    [intervalMs],
  )
  return useSyncExternalStore(subscribe, () => tickerFor(intervalMs).now)
}
