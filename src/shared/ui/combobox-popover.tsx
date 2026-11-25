import type { ReactElement, ReactNode, RefObject } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

const CONTENT_CLASS =
  'bg-popover text-popover-foreground w-[var(--radix-popover-trigger-width)] max-w-72 min-w-52 p-0'

export function ComboboxCommandPanel({
  query,
  onQueryChange,
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  listRef,
  onQueryInput,
  children,
}: {
  query: string
  onQueryChange: (query: string) => void
  searchPlaceholder?: string
  emptyText?: string
  listRef: RefObject<HTMLDivElement | null>
  onQueryInput?: () => void
  children: ReactNode
}) {
  return (
    <PopoverContent align="start" className={CONTENT_CLASS}>
      <Command shouldFilter>
        <CommandInput
          value={query}
          placeholder={searchPlaceholder}
          onValueChange={(next) => {
            onQueryChange(next)
            onQueryInput?.()
          }}
        />
        <CommandList ref={listRef}>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>{children}</CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  )
}

export function ComboboxPopover({
  open,
  onOpenChange,
  trigger,
  query,
  onQueryChange,
  searchPlaceholder,
  emptyText,
  listRef,
  onQueryInput,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
  query: string
  onQueryChange: (query: string) => void
  searchPlaceholder?: string
  emptyText?: string
  listRef: RefObject<HTMLDivElement | null>
  onQueryInput?: () => void
  children: ReactNode
}) {
  return (
    <Popover open={open} modal={false} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <ComboboxCommandPanel
        query={query}
        onQueryChange={onQueryChange}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        listRef={listRef}
        onQueryInput={onQueryInput}
      >
        {children}
      </ComboboxCommandPanel>
    </Popover>
  )
}
