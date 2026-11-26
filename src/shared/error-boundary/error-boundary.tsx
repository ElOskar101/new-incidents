import { AlertTriangle } from 'lucide-react'
import { Component, type ReactNode } from 'react'
import { Button } from '@/shared/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Clears a failure when it changes (e.g. the pathname) without remounting healthy children. */
  resetKey?: string
}

interface ErrorBoundaryState {
  failed: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <section
        role="alert"
        className="bg-background relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%)]"
        />
        <div className="relative flex max-w-md flex-col items-center text-center">
          <span className="bg-muted text-muted-foreground ring-border mb-5 inline-flex size-12 items-center justify-center rounded-full ring-1">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            The page stopped working unexpectedly. You can try again or reload the application.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button type="button" onClick={() => this.setState({ failed: false })}>
              Try again
            </Button>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </section>
    )
  }
}
