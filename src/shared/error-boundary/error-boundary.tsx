import { Component, type ReactNode } from 'react'
import { Button } from '@/shared/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Catches render errors in its subtree and shows a recovery screen instead of a blank page.
 * Render it with a `key` that changes on navigation so moving to another page resets it.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section role="alert" className="space-y-4 p-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          The page stopped working unexpectedly. You can try again or reload the application.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => this.setState({ failed: false })}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </section>
    )
  }
}
