# Color palette

The palette is defined in [`src/index.css`](../src/index.css) using Tailwind's `@theme`. Primary blue and secondary violet come from [`public/logo.svg`](../public/logo.svg). The remaining colors support application surfaces, text, and incident statuses.

## Brand colors

| Token | Hex | Purpose |
| --- | --- | --- |
| `primary` | `#1F6FB1` | Main actions, links, active navigation, and focus indicators |
| `primary-hover` | `#195B92` | Hover background for primary actions |
| `primary-subtle` | `#EDF5FC` | Light primary backgrounds |
| `primary-content` | `#FFFFFF` | Text and icons on primary backgrounds |
| `secondary` | `#6C4BE8` | Supporting actions and brand accents |
| `secondary-hover` | `#5735CE` | Hover background for secondary actions |
| `secondary-subtle` | `#F2EFFD` | Light secondary backgrounds |
| `secondary-content` | `#FFFFFF` | Text and icons on secondary backgrounds |

## Neutral colors

| Token | Hex | Purpose |
| --- | --- | --- |
| `background` | `#F8F9FC` | Application background |
| `surface` | `#FFFFFF` | Cards, navigation, and inputs |
| `surface-hover` | `#F0F2F7` | Hover background for neutral elements |
| `border` | `#E1E4ED` | Decorative borders and dividers |
| `foreground` | `#202436` | Main text |
| `muted` | `#636779` | Supporting text and placeholders |

## Status colors

| Status token | Hex | Subtle token | Hex | Content token | Hex |
| --- | --- | --- | --- | --- | --- |
| `success` | `#15803D` | `success-subtle` | `#F0FDF4` | `success-content` | `#FFFFFF` |
| `warning` | `#B45309` | `warning-subtle` | `#FFFBEB` | `warning-content` | `#FFFFFF` |
| `danger` | `#B91C1C` | `danger-subtle` | `#FEF2F2` | `danger-content` | `#FFFFFF` |
| `info` | `#1F6FB1` | `info-subtle` | `#EDF5FC` | `info-content` | `#FFFFFF` |

Use success for successful outcomes, warning for conditions needing attention, danger for errors or destructive actions, and info for informational messages. Include a text label or icon so color is not the only way to communicate status.

## Tailwind usage

Every token is available through Tailwind color utilities, such as `bg-primary`, `text-muted`, `border-border`, and `ring-primary`. State variants work normally, including `hover:bg-primary-hover` and `focus-visible:ring-primary`.

### Primary action

```tsx
<button
  className="rounded-md bg-primary px-4 py-2 text-primary-content hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
>
  Create incident
</button>
```

### Search input

```tsx
<label className="block text-sm text-foreground">
  Search incidents
  <input
    type="search"
    placeholder="Search by title…"
    className="mt-1 w-full rounded-md border border-muted bg-surface px-3 py-2 text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  />
</label>
```

### Status badge

```tsx
<span className="rounded-full bg-success-subtle px-3 py-1 text-sm font-medium text-success">
  Resolved
</span>
```

Pair a solid background with its matching `*-content` token. Pair a subtle background with the corresponding base color for text. Check contrast when using other combinations, opacity, or custom backgrounds; decorative border colors may need a stronger alternative for interactive controls.

## Maintaining the palette

Update the theme in `src/index.css` and this reference together. Prefer semantic utilities over repeated hex values in components so changes apply consistently throughout the application. The current palette defines a light theme only.
