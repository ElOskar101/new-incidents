import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import type { Incident } from '../types/incident'

export function DeleteIncidentDialog({
  incident,
  open,
  onOpenChange,
  onConfirm,
}: {
  incident: Pick<Incident, 'id' | 'title'>
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this incident?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-foreground font-medium">{incident.title}</span> (
            <span className="font-mono text-xs">{incident.id}</span>) will be removed from the
            board. You can undo this right after.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete incident
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
