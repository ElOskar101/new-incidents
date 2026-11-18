import {SearchInput} from "./inputs/search-input.tsx";
import {RoundedButton} from "./buttons/rounded-button.tsx";
import {Bell} from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-2"
      >
          <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Incidents-logo" className="h-8 w-auto" />
              <a href="/"
                  className="rounded text-xl font-normal tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  Incidents
              </a>
          </div>

          <div className="flex items-center gap-2">
              <SearchInput/>
          </div>

        <ul className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <li>
                <RoundedButton>
                    <Bell/>
                </RoundedButton>
            </li>
          <li>
            <a
              href="/"
              aria-current="page"
              className="block rounded-md bg-primary-subtle px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#incidents"
              className="block rounded-md px-4 py-2 text-muted transition-colors hover:bg-secondary-subtle hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Incidents
            </a>
          </li>

        </ul>
      </nav>
    </header>
  )
}
