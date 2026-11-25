import { Link } from 'react-router'
import { AccountSummary } from '@/features/auth'
import { DarkModeToggle } from '@/shared/theme'

export function Header() {
  return (
    <header className="border-border bg-card shrink-0 border-b">
      <div className="flex h-12 w-full items-center justify-between px-3 sm:px-4">
        <Link
          to="/"
          aria-label="Incidents home"
          className="flex shrink-0 items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {/* The mark is a chevron; the tile keeps it from reading as a Back arrow. */}
          <span className="bg-background ring-border flex size-7 items-center justify-center rounded-md shadow-xs ring-1">
            <img src="/logo.svg" alt="" className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">Incidents</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <AccountSummary />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
