import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/shared/ui/navigation-menu'
import { cn } from '@/shared/lib/utils'

export interface NavTabItem {
  to: string
  label: string
  icon?: LucideIcon
  end?: boolean
}

const tabClassName =
  'inline-flex h-full min-h-10 flex-row items-center justify-center gap-1.5 rounded-none border-b-2 border-transparent px-3 py-0 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none active:bg-accent active:text-accent-foreground data-[active=true]:bg-muted/50 data-[active=true]:text-foreground data-[active=true]:hover:bg-muted/60 data-[active=true]:focus:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-muted/50 aria-[current=page]:text-foreground'

/** Rectangular route tabs built on shadcn Navigation Menu. */
export function NavTabs({
  items,
  label = 'Main navigation',
}: {
  items: readonly NavTabItem[]
  label?: string
}) {
  return (
    <NavigationMenu
      viewport={false}
      aria-label={label}
      className="h-full max-w-none flex-none items-stretch justify-start"
    >
      <NavigationMenuList className="h-full items-stretch justify-start gap-0">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavigationMenuItem key={item.to} className="flex h-full">
              <NavigationMenuLink asChild className={cn(tabClassName, 'h-full')}>
                <NavLink to={item.to} end={item.end}>
                  {Icon ? (
                    <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden="true" />
                  ) : null}
                  {item.label}
                </NavLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
