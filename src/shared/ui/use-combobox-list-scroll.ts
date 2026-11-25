import { useRef } from 'react'

export function useComboboxListScroll() {
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return
      if (typeof list.scrollTo === 'function') list.scrollTo({ top: 0 })
      else list.scrollTop = 0
    })
  }

  return { listRef, scrollToTop }
}
