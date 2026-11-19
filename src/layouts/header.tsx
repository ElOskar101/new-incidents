import { Bell, Home, ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import { AccountSummary } from '@/features/auth'
import { NavTabs, type NavTabItem } from '@/shared/nav'
import { DarkModeToggle } from '@/shared/theme'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { SearchInput } from '@/layouts/search-input'

const NAV_ITEMS: readonly NavTabItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/incidents', label: 'Incidents', icon: ListChecks },
]

export function Header() {
  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 sm:grid-cols-[auto_1fr_auto] sm:px-6">
        <Link
          to="/"
          aria-label="Incidents home"
          className="flex items-center gap-2 justify-self-start rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <img src="/logo.svg" alt="" className="h-8 w-auto" />
          <span className="text-xl font-normal tracking-tight text-foreground">Incidents</span>
        </Link>

        <div className="col-span-2 row-start-2 flex min-h-10 items-stretch sm:col-span-1 sm:row-start-auto sm:justify-center">
          <NavTabs items={NAV_ITEMS} />
        </div>

        <div className="flex items-center justify-self-end gap-2">
          <div className="hidden md:block">
            <SearchInput />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full"
          >
            <Bell className="size-4" />
          </Button>
          <Separator orientation="vertical" className="!h-5" />
          <AccountSummary />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
