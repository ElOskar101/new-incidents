import { FileQuestion } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog'
import { useOverlayNavigation } from '../hooks/use-overlay-navigation'

export function IncidentNotFound({ id }: { id: string | undefined }) {
  const overlay = useOverlayNavigation()
  const close = () => overlay.close()

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex flex-col items-center gap-3 text-center sm:max-w-sm">
        <FileQuestion className="text-muted-foreground size-8" aria-hidden="true" />
        <DialogTitle>Incident not found</DialogTitle>
        <DialogDescription>
          {id ? (
            <>
              <span className="font-mono text-xs">{id}</span> does not exist or was deleted.
            </>
          ) : (
            'This incident does not exist or was deleted.'
          )}
        </DialogDescription>
        <Button type="button" onClick={close} className="mt-2">
          Back to board
        </Button>
      </DialogContent>
    </Dialog>
  )
}
