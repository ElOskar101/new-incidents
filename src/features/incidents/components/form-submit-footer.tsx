import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import type { IncidentFormFieldHelpers } from './incident-form-fields'
import { fieldId } from './incident-form-ids'

export function FormSubmitFooter({
  values,
  set,
  submitted,
  errorCount,
  pending,
  submitLabel,
  onCancel,
}: IncidentFormFieldHelpers & {
  submitted: boolean
  errorCount: number
  pending: boolean
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <footer className="border-border bg-card/80 flex flex-col gap-3 border-t px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <Switch
            id={fieldId('watching')}
            checked={values.watching}
            onCheckedChange={(watching) => set('watching', watching)}
          />
          <Label htmlFor={fieldId('watching')} className="text-xs font-normal">
            Notify me about updates
          </Label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        {submitted && errorCount > 0 ? (
          <p className="text-danger-strong mr-1 text-xs" role="status">
            {errorCount === 1 ? '1 field needs attention' : `${errorCount} fields need attention`}
          </p>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </footer>
  )
}
