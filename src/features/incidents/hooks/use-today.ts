import { toDateInputValue } from '../utils/format'
import { useNow } from './use-now'

/** Local `YYYY-MM-DD`; rolls over at midnight without a reload. */
export function useToday(): string {
  return toDateInputValue(new Date(useNow()))
}
