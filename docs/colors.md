# Color palette

The palette lives in [`src/index.css`](../src/index.css) and matches the Orioris
shadcn theme: warm bone neutrals, violet primary, and soft shadows in `oklch`.

Incident status tokens (`success`, `warning`, `danger`, `info`) and a few brand
aliases (`primary-hover`, `surface`, …) are mapped onto that same system so badges
and legacy utilities stay available.

## Core (light)

| Token                                    | Value                           | Purpose                |
| ---------------------------------------- | ------------------------------- | ---------------------- |
| `background`                             | `oklch(0.965 0.006 85)`         | Page bone / off-white  |
| `foreground`                             | `oklch(0.24 0.012 60)`          | Main text              |
| `card` / `surface`                       | `oklch(0.985 0.003 85)`         | Cards, nav, inputs     |
| `primary`                                | `oklch(0.5393 0.2713 286.7462)` | Actions, links, focus  |
| `primary-foreground` / `primary-content` | `oklch(0.99 0.002 85)`          | Text on primary        |
| `primary-hover`                          | `oklch(0.48 0.26 286.7462)`     | Primary hover          |
| `primary-subtle` / `accent`              | `oklch(0.94 0.03 286.7462)`     | Light violet washes    |
| `secondary`                              | `oklch(0.94 0.008 90)`          | Soft neutral secondary |
| `secondary-foreground`                   | `oklch(0.28 0.012 60)`          | Text on secondary      |
| `muted`                                  | `oklch(0.945 0.007 85)`         | Muted surfaces         |
| `muted-foreground`                       | `oklch(0.48 0.012 60)`          | Supporting text        |
| `destructive` / `danger`                 | `oklch(0.629 0.1902 23.0704)`   | Errors / destructive   |
| `border`                                 | `oklch(0.88 0.01 85)`           | Borders and dividers   |
| `ring`                                   | `oklch(0.55 0.04 286)`          | Focus rings            |

Dark mode uses the same token names with the Orioris `.dark` values (cooler violet
primary on deep blue-gray surfaces).

## Status colors

| Status  | Token                      | Subtle           | Content           |
| ------- | -------------------------- | ---------------- | ----------------- |
| Success | `success`                  | `success-subtle` | `success-content` |
| Warning | `warning`                  | `warning-subtle` | `warning-content` |
| Danger  | `danger` (= `destructive`) | `danger-subtle`  | `danger-content`  |
| Info    | `info`                     | `info-subtle`    | `info-content`    |

Values are oklch siblings of the Orioris chart greens/oranges/blues so badges sit
in the same family as charts and alerts. Prefer a label or icon with color.

## shadcn usage

Components use semantic utilities such as `bg-primary`, `text-muted-foreground`,
`border-border`, and `ring-primary`. Incident aliases (`bg-surface`,
`bg-success-subtle`, `hover:bg-primary-hover`) resolve to the same CSS variables.

### Primary action

```tsx
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
  Create incident
</button>
```

### Status badge

```tsx
<span className="rounded-full bg-success-subtle px-3 py-1 text-sm font-medium text-success">
  Resolved
</span>
```

## Maintaining the palette

Keep [`src/index.css`](../src/index.css) and this doc in sync with Orioris when the
shared company theme changes. Prefer semantic utilities over raw color literals.
