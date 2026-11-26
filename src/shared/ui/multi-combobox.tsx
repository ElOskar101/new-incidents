import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ComboboxCommandPanel } from '@/shared/ui/combobox-popover'
import { type ComboboxOption } from '@/shared/ui/combobox-types'
import { CommandItem } from '@/shared/ui/command'
import { Popover, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useComboboxListScroll } from '@/shared/ui/use-combobox-list-scroll'

const VISIBLE_VALUE_COUNT = 1

export function MultiCombobox({
  id,
  values,
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
  values: readonly string[]
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  options: readonly ComboboxOption[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { listRef, scrollToTop } = useComboboxListScroll()
  const selectedSet = new Set(values)
  const known = new Set(options.map((option) => option.value))
  const extras: ComboboxOption[] = values
    .filter((value) => !known.has(value))
    .map((value) => ({ value, label: value }))
  const catalog: ComboboxOption[] = [...extras, ...options]
  const selectedOptions = values.flatMap((value) => {
    const match = catalog.find((option) => option.value === value)
    return match ? [match] : []
  })
  const unselectedOptions = catalog.filter((option) => !selectedSet.has(option.value))
  const orderedOptions = [...selectedOptions, ...unselectedOptions]
  const visibleLabels = selectedOptions.slice(0, VISIBLE_VALUE_COUNT).map((option) => option.label)
  const overflowCount = Math.max(0, selectedOptions.length - VISIBLE_VALUE_COUNT)

  const toggle = (value: string) => {
    if (selectedSet.has(value)) onChange(values.filter((current) => current !== value))
    else onChange([...values, value])
  }

  return (
    <Tooltip>
      <Popover
        open={open}
        modal={false}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) {
            setQuery('')
            scrollToTop()
          }
        }}
      >
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
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
                'border-input bg-black/[0.06] hover:bg-black/[0.09] dark:bg-black/40 dark:hover:bg-black/50 h-8 w-full justify-between gap-1.5 px-2 font-normal shadow-xs',
                selectedOptions.length === 0 && 'text-muted-foreground',
                invalid &&
                  'border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]',
              )}
            >
              {selectedOptions.length === 0 ? (
                <span className="min-w-0 truncate">{placeholder}</span>
              ) : (
                <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                  {selectedOptions[0]?.icon}
                  <span className="min-w-0 truncate">{visibleLabels.join(', ')}</span>
                  {overflowCount > 0 ? (
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      +{overflowCount}
                    </span>
                  ) : null}
                </span>
              )}
              <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <ComboboxCommandPanel
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          listRef={listRef}
          onQueryInput={scrollToTop}
        >
          {orderedOptions.map((option) => {
            const selected = selectedSet.has(option.value)
            return (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => toggle(option.value)}
              >
                <Check
                  className={cn('size-3.5', selected ? 'opacity-100' : 'opacity-0')}
                  aria-hidden="true"
                />
                {option.icon}
                {option.label}
              </CommandItem>
            )
          })}
        </ComboboxCommandPanel>
      </Popover>
      {selectedOptions.length > 0 ? (
        <TooltipContent side="bottom" align="start" className="max-w-72 px-3 py-2">
          <ul className="space-y-1 text-left">
            {selectedOptions.map((option) => (
              <li key={option.value} className="flex items-center gap-1.5">
                {option.icon}
                {option.label}
              </li>
            ))}
          </ul>
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}
