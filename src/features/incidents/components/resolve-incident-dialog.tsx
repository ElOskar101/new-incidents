import { CheckCircle2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { RESOLUTION_MAX } from '../constants/catalog'
import type { Incident } from '../types/incident'

export function ResolveIncidentDialog({
  incident,
  onCancel,
  onConfirm,
}: {
  incident: Pick<Incident, 'id' | 'title'>
  onCancel: () => void
  onConfirm: (resolution: string) => Promise<void>
}) {
  const id = useId()
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!resolution.trim()) {
              setError('Describe how the incident was resolved.')
              document.getElementById(id)?.focus()
              return
            }
            setPending(true)
            void onConfirm(resolution).finally(() => setPending(false))
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-status-done size-4" aria-hidden="true" />
              Resolve incident
            </DialogTitle>
            <DialogDescription>{incident.title}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor={id}>Resolution</Label>
            <Textarea
              id={id}
              value={resolution}
              maxLength={RESOLUTION_MAX}
              rows={4}
              placeholder="What was the cause and what fixed it?"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) => {
                setResolution(event.target.value)
                if (error) setError(null)
              }}
            />
            {error ? (
              <p id={`${id}-error`} className="text-danger-strong text-xs">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Mark as done
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
