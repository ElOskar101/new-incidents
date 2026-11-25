import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

export interface FieldA11y {
  id: string
  'aria-invalid': boolean | undefined
  'aria-describedby': string | undefined
}

const PROPERTY_ROW = 'grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-2'

export function FormField({
  id,
  label,
  optional,
  hint,
  error,
  aside,
  className,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  className?: string
  children: (a11y: FieldA11y) => ReactNode
}) {
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {optional ? (
            <span className="text-muted-foreground text-xs font-normal">Optional</span>
          ) : null}
        </Label>
        {aside}
      </div>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? messageId : undefined,
      })}
      {message ? (
        <p
          id={messageId}
          className={cn('text-xs', error ? 'text-danger-strong' : 'text-muted-foreground')}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}

export function PropertyFormField({
  id,
  label,
  optional,
  hint,
  error,
  aside,
  className,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  hint?: ReactNode
  error?: string
  aside?: ReactNode
  className?: string
  children: (a11y: FieldA11y) => ReactNode
}) {
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn(PROPERTY_ROW, className)}>
      <Label htmlFor={id} className="text-muted-foreground pt-0 text-xs leading-8 font-normal">
        {label}
        {optional ? <span className="sr-only"> (optional)</span> : null}
      </Label>
      <div className="min-w-0 space-y-1">
        {aside}
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': message ? messageId : undefined,
        })}
        {message ? (
          <p
            id={messageId}
            className={cn('text-xs', error ? 'text-danger-strong' : 'text-muted-foreground')}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function PropertyGroup({
  children,
  divided = false,
  className,
}: {
  children: ReactNode
  divided?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(divided ? 'border-border space-y-2.5 border-t pt-4' : 'space-y-1', className)}
    >
      {children}
    </div>
  )
}

function counterStatus(length: number, max: number, min?: number) {
  if (length >= max) return 'max'
  if (min !== undefined && length < min) return 'short'
  return 'ok'
}

// Screen readers hear one announcement when a limit is crossed, not every keystroke.
export function CharacterCounter({
  length,
  max,
  min,
  label,
}: {
  length: number
  max: number
  min?: number
  label: string
}) {
  const status = counterStatus(length, max, min)
  const announcement =
    status === 'max'
      ? `${label} character limit reached.`
      : status === 'ok' && min !== undefined
        ? `${label} meets the minimum length.`
        : ''

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'text-muted-foreground text-xs tabular-nums',
          status === 'max' && 'text-warning-strong',
          status === 'short' && length > 0 && 'text-danger-strong',
        )}
      >
        {status === 'short' && length > 0 ? `${(min ?? 0) - length} more needed · ` : null}
        {length}/{max}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
