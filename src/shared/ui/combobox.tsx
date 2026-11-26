import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ComboboxPopover } from '@/shared/ui/combobox-popover'
import { type ComboboxOption } from '@/shared/ui/combobox-types'
import { CommandItem } from '@/shared/ui/command'
import { useComboboxListScroll } from '@/shared/ui/use-combobox-list-scroll'

export type { ComboboxOption } from '@/shared/ui/combobox-types'

export function Combobox({
  id,
  value,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  disabled,
  invalid,
  describedBy,
  options,
  onChange,
}: {
  id: string
  value: string
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  options: readonly ComboboxOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { listRef, scrollToTop } = useComboboxListScroll()
  const resolvedOptions =
    value && !options.some((option) => option.value === value)
      ? [{ value, label: value }, ...options]
      : options
  const selected = resolvedOptions.find((option) => option.value === value)

  return (
    <ComboboxPopover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery('')
          scrollToTop()
        }
      }}
      trigger={
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-describedby={describedBy}
          disabled={disabled}
          data-invalid={invalid ? true : undefined}
          className={cn(
            'border-input bg-black/[0.06] hover:bg-black/[0.09] dark:bg-black/40 dark:hover:bg-black/50 h-8 w-full justify-between px-2 font-normal shadow-xs',
            'disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-transparent disabled:shadow-none disabled:hover:bg-transparent dark:disabled:bg-transparent',
            !selected && 'text-muted-foreground',
            invalid && 'border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]',
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {selected?.icon}
            <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      }
      query={query}
      onQueryChange={setQuery}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      listRef={listRef}
      onQueryInput={scrollToTop}
    >
      {resolvedOptions.map((option) => (
        <CommandItem
          key={option.value}
          value={option.label}
          onSelect={() => {
            onChange(option.value)
            setOpen(false)
          }}
        >
          <Check
            className={cn('size-3.5', option.value === value ? 'opacity-100' : 'opacity-0')}
            aria-hidden="true"
          />
          {option.icon}
          {option.label}
        </CommandItem>
      ))}
    </ComboboxPopover>
  )
}
