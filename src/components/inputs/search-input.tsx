import {Search} from "lucide-react";

export const SearchInput = () => {
    return (
        <div className="relative">
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
                type="search"
                aria-label="Buscar"
                className="w-full rounded-full border border-border bg-background py-1 pl-9 pr-3 placeholder:text-muted focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
                placeholder="Buscar..."
            />
        </div>
    )
}
