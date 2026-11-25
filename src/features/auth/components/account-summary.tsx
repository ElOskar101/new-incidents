import { LogOut, User } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import type { AccountProfile } from '../services/current-user'
import { getAccountSnapshot, subscribeAccount } from '../services/load-account'
import { clearAccountCache } from '../services/load-account'
import { clearAuthSession, readStoredToken, redirectToLogin } from '../services/session'

export function AccountSummary() {
  const token = readStoredToken()
  if (!token) return null
  return <AccountDetails token={token} />
}

function AccountDetails({ token }: { token: string }) {
  const result = useSyncExternalStore(
    (listener) => subscribeAccount(token, listener),
    getAccountSnapshot,
  )
  if (result.status === 'loading') {
    return (
      <div role="status" aria-label="Loading account" className="flex items-center gap-2">
        <span className="sr-only">Loading account...</span>
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="hidden flex-col gap-1 lg:flex">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
    )
  }
  if (result.status === 'anonymous') return null
  if (result.status === 'unavailable') {
    return (
      <div className="flex items-center gap-2">
        <p role="status" className="text-muted-foreground sr-only text-sm lg:not-sr-only">
          Account details unavailable
        </p>
        <button
          type="button"
          onClick={logOut}
          aria-label="Log out"
          className="rounded p-2 hover:bg-muted"
        >
          <LogOut aria-hidden="true" className="size-4" />
        </button>
      </div>
    )
  }
  return <AccountName profile={result.profile} />
}

function AccountAvatar({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
      <User aria-hidden="true" className="size-4" />
    </span>
  )
}

function logOut() {
  clearAuthSession()
  clearAccountCache()
  redirectToLogin()
}

function AccountName({ profile }: { profile: AccountProfile }) {
  const primary = profile.name ?? profile.email ?? 'Signed in'
  const email =
    profile.name && profile.email && profile.email !== profile.name ? profile.email : null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={primary}
          className="hover:bg-muted/60 focus-visible:ring-ring/50 flex min-w-0 items-center gap-2 rounded-[8px] px-1.5 py-1 text-left focus-visible:ring-2 focus-visible:outline-none"
        >
          <AccountAvatar imageUrl={profile.imageUrl} />
          <span className="hidden min-w-0 flex-col lg:flex">
            <span className="max-w-56 truncate text-sm font-medium">{primary}</span>
            {email ? (
              <span className="text-muted-foreground max-w-56 truncate text-xs">{email}</span>
            ) : null}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-[8px]">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium">{primary}</span>
          {email ? (
            <span className="text-muted-foreground block truncate text-xs">{email}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
