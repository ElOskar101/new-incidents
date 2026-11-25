import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useBlocker } from 'react-router'
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
import { Button } from '@/shared/ui/button'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/shared/ui/sheet'

export interface FormDialogControls {
  requestClose: () => void
  setDirty: (dirty: boolean) => void
  closeAfterSave: () => void
}

export function IncidentFormDialog({
  title,
  description,
  badge,
  leading,
  caretAtEndOf,
  onClose,
  children,
}: {
  title: string
  description: ReactNode
  badge?: ReactNode
  leading?: ReactNode
  caretAtEndOf?: string
  onClose: () => void
  children: (controls: FormDialogControls) => ReactNode
}) {
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const latestOnClose = useRef(onClose)
  /** Radix closes the alert after "Discard"; that close must not reset the proceeding blocker. */
  const discarding = useRef(false)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !saved && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    latestOnClose.current = onClose
  })

  // Runs after the blocker picked up `saved`, so leaving is not intercepted.
  useEffect(() => {
    if (saved) latestOnClose.current()
  }, [saved])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const controls: FormDialogControls = {
    requestClose: onClose,
    setDirty,
    closeAfterSave: () => setSaved(true),
  }

  return (
    <>
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <SheetContent
          showCloseButton={false}
          side="center"
          className="gap-0 sm:max-w-5xl"
          onInteractOutside={(event) => {
            event.preventDefault()
            onClose()
          }}
          onOpenAutoFocus={(event) => {
            const field = caretAtEndOf ? document.getElementById(caretAtEndOf) : null
            if (!(field instanceof HTMLInputElement)) return
            event.preventDefault()
            field.focus()
            field.setSelectionRange(field.value.length, field.value.length)
          }}
        >
          <header className="border-border flex shrink-0 items-center gap-2 border-b px-4 py-3">
            {leading}
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm leading-snug font-semibold tracking-tight">
                {title}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground mt-0.5 truncate text-xs leading-snug">
                {description}
              </SheetDescription>
            </div>
            {badge}
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                <X />
              </Button>
            </SheetClose>
          </header>
          {children(controls)}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (open || blocker.state !== 'blocked') return
          if (discarding.current) discarding.current = false
          else blocker.reset()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (blocker.state !== 'blocked') return
                discarding.current = true
                blocker.proceed()
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
