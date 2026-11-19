import { useRef, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import type { ComboboxOption } from '@/shared/ui/combobox'

const VISIBLE_VALUE_COUNT = 2

/** Searchable multi-select: selected options stay pinned at the top of the list. */
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
  disabled: boolean
  invalid: boolean
  describedBy?: string
  options: readonly ComboboxOption[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const selectedSet = new Set(values)
  const known = new Set(options.map((option) => option.value))
  const extras = values
    .filter((value) => !known.has(value))
    .map((value) => ({ value, label: value }))
  const catalog = [...extras, ...options]
  const selectedOptions = values.flatMap((value) => {
    const match = catalog.find((option) => option.value === value)
    return match ? [match] : []
  })
  const unselectedOptions = catalog.filter((option) => !selectedSet.has(option.value))
  const orderedOptions = [...selectedOptions, ...unselectedOptions]
  const visibleLabels = selectedOptions.slice(0, VISIBLE_VALUE_COUNT).map((option) => option.label)
  const overflowCount = Math.max(0, selectedOptions.length - VISIBLE_VALUE_COUNT)

  const showMatchesFromTop = () => {
    requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return
      if (typeof list.scrollTo === 'function') list.scrollTo({ top: 0 })
      else list.scrollTop = 0
    })
  }

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
            showMatchesFromTop()
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
              data-invalid={invalid || undefined}
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
        <PopoverContent
          align="start"
          className="bg-popover text-popover-foreground w-[var(--radix-popover-trigger-width)] max-w-72 min-w-52 p-0"
        >
          <Command shouldFilter>
            <CommandInput
              value={query}
              placeholder={searchPlaceholder}
              onValueChange={(next) => {
                setQuery(next)
                showMatchesFromTop()
              }}
            />
            <CommandList ref={listRef}>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
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
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOptions.length > 0 ? (
        <TooltipContent side="bottom" align="start" className="max-w-72 px-3 py-2">
          <ul className="space-y-1 text-left">
            {selectedOptions.map((option) => (
              <li key={option.value}>{option.label}</li>
            ))}
          </ul>
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}
