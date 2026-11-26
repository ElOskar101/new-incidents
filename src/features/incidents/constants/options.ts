import { createElement } from 'react'
import { Globe } from 'lucide-react'
import type { ComboboxOption } from '@/shared/ui/combobox-types'
import { CARRIERS, CLIENTS, GENERAL_CARRIER } from './catalog'

export const CLIENT_OPTIONS: readonly ComboboxOption[] = CLIENTS.map((client) => ({
  value: client.name,
  label: client.name,
}))

const CARRIER_NAME_OPTIONS: readonly ComboboxOption[] = CARRIERS.map((carrier) => ({
  value: carrier,
  label: carrier,
}))

export const CARRIER_OPTIONS: readonly ComboboxOption[] = [
  {
    value: GENERAL_CARRIER,
    label: 'General',
    icon: createElement(Globe, {
      className: 'text-muted-foreground size-3.5 shrink-0',
      'aria-hidden': true,
    }),
  },
  ...CARRIER_NAME_OPTIONS,
]
