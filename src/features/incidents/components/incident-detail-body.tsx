import { AlignLeft, CheckCircle2, Table2 } from 'lucide-react'
import type { RefObject } from 'react'
import { SheetTitle } from '@/shared/ui/sheet'
import { useOverlayNavigation, type OverlayState } from '../hooks/use-overlay-navigation'
import type { Incident } from '../types/incident'
import { DetailSection } from './detail-section'
import { IncidentAttachments } from './incident-attachments'
import { IncidentHeroMeta } from './incident-meta-strip'
import { IncidentPropertiesPanel } from './incident-properties-panel'

export function IncidentDetailBody({
  incident,
  titleRef,
}: {
  incident: Incident
  titleRef: RefObject<HTMLHeadingElement | null>
}) {
  const overlay = useOverlayNavigation()
  const editPath = `/incidents/${incident.id}/edit`

  return (
    <div
      data-print-expand
      className="scrollbar-app grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <article className="min-w-0 space-y-3 p-4 md:p-5">
        <div className="border-border from-muted/40 to-muted/10 space-y-3 rounded-md border bg-gradient-to-b p-3.5 shadow-xs">
          <div className="space-y-2">
            <SheetTitle
              ref={titleRef}
              tabIndex={-1}
              className="text-lg leading-snug font-semibold tracking-tight outline-none"
            >
              {incident.title}
            </SheetTitle>
            <IncidentHeroMeta incident={incident} />
          </div>

          <div className="border-border space-y-1.5 border-t pt-3">
            <p className="text-muted-foreground flex items-center gap-1.5 text-2xs font-semibold tracking-wide uppercase">
              <span className="bg-background text-muted-foreground ring-border/80 inline-flex size-5 shrink-0 items-center justify-center rounded ring-1">
                <AlignLeft className="size-3" aria-hidden="true" />
              </span>
              Description
            </p>
            <p className="text-foreground/90 max-w-prose text-sm leading-relaxed whitespace-pre-line">
              {incident.description}
            </p>
          </div>

          {incident.rows.length > 0 ? (
            <div
              aria-labelledby="detail-rows"
              className="border-border flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t pt-3"
            >
              <p
                id="detail-rows"
                className="text-muted-foreground flex items-center gap-1.5 text-2xs font-semibold tracking-wide uppercase"
              >
                <span className="bg-background text-muted-foreground ring-border/80 inline-flex size-5 shrink-0 items-center justify-center rounded ring-1">
                  <Table2 className="size-3" aria-hidden="true" />
                </span>
                Rows
              </p>
              <p className="text-foreground font-mono text-xs tabular-nums">
                {incident.rows.map((row, index) => (
                  <span key={row}>
                    {index > 0 ? (
                      <span className="text-muted-foreground/50 mx-1 font-sans" aria-hidden="true">
                        ·
                      </span>
                    ) : null}
                    {row}
                  </span>
                ))}
              </p>
            </div>
          ) : null}
        </div>

        {incident.status === 'done' && incident.resolution ? (
          <DetailSection
            id="detail-resolution"
            title="Resolution"
            icon={CheckCircle2}
            className="bg-success-subtle border-success/20"
          >
            <p className="text-xs leading-relaxed whitespace-pre-line">{incident.resolution}</p>
          </DetailSection>
        ) : null}

        <IncidentAttachments
          attachments={incident.attachments}
          editPath={editPath}
          editTo={overlay.to}
          editLinkState={{ canGoBack: true } satisfies OverlayState}
        />
      </article>

      <IncidentPropertiesPanel incident={incident} />
    </div>
  )
}
