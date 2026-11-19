import { Search } from 'lucide-react'

export function SearchInput() {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        aria-label="Search"
        className="border-border bg-background w-full rounded-full border py-1 pr-3 pl-9 placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
        placeholder="Search..."
      />
    </div>
  )
}
