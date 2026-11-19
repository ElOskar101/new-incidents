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

export interface ComboboxOption {
  value: string
  label: string
}

/** Searchable single-select: shadcn Popover + Command. */
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
  disabled: boolean
  invalid: boolean
  describedBy?: string
  options: readonly ComboboxOption[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const resolvedOptions =
    value && !options.some((option) => option.value === value)
      ? [{ value, label: value }, ...options]
      : options
  const selected = resolvedOptions.find((option) => option.value === value)

  const showMatchesFromTop = () => {
    requestAnimationFrame(() => {
      const list = listRef.current
      if (!list) return
      if (typeof list.scrollTo === 'function') list.scrollTo({ top: 0 })
      else list.scrollTop = 0
    })
  }

  return (
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
            'border-input bg-black/[0.06] hover:bg-black/[0.09] dark:bg-black/40 dark:hover:bg-black/50 h-8 w-full justify-between px-2 font-normal shadow-xs',
            !selected && 'text-muted-foreground',
            invalid && 'border-destructive ring-destructive/20 dark:ring-destructive/40 ring-[3px]',
          )}
        >
          <span className="min-w-0 truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
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
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
