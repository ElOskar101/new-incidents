# Color palette

The palette lives in [`src/index.css`](../src/index.css). Neutrals and structure
follow the shared Orioris shadcn system (warm bone surfaces, soft shadows in
`oklch`). The **primary / accent** is Incidents-specific: **Indigo bridge**
`#4560C8` (`oklch(0.5256 0.1644 269.1155)`), mid between the logo blue and
violet, so the product does not share Orioris’s violet primary.

Incident status tokens (`success`, `warning`, `danger`, `info`) and brand
aliases (`primary-hover`, `surface`, …) map onto the same CSS variables.

## Core (light)

| Token                                    | Value                           | Purpose                  |
| ---------------------------------------- | ------------------------------- | ------------------------ |
| `background`                             | `oklch(0.965 0.006 85)`         | Page bone / off-white    |
| `foreground`                             | `oklch(0.24 0.012 60)`          | Main text                |
| `card` / `surface`                       | `oklch(0.985 0.003 85)`         | Cards, nav, inputs       |
| `primary`                                | `oklch(0.5256 0.1644 269.1155)` | Actions, links (#4560C8) |
| `primary-foreground` / `primary-content` | `oklch(0.99 0.002 85)`          | Text on primary          |
| `primary-hover`                          | `oklch(0.4567 0.1438 269.3927)` | Primary hover            |
| `primary-subtle` / `accent`              | `oklch(0.94 0.03 269.1155)`     | Light indigo washes      |
| `secondary`                              | `oklch(0.94 0.008 90)`          | Soft neutral secondary   |
| `secondary-foreground`                   | `oklch(0.28 0.012 60)`          | Text on secondary        |
| `muted`                                  | `oklch(0.945 0.007 85)`         | Muted surfaces           |
| `muted-foreground`                       | `oklch(0.48 0.012 60)`          | Supporting text          |
| `destructive` / `danger`                 | `oklch(0.629 0.1902 23.0704)`   | Errors / destructive     |
| `border`                                 | `oklch(0.88 0.01 85)`           | Borders and dividers     |
| `ring`                                   | `oklch(0.55 0.04 269)`          | Focus rings              |

Dark mode keeps the same token names with a slightly brighter indigo primary on
deep blue-gray surfaces.

## Status colors

| Status  | Token                      | Subtle           | Content           |
| ------- | -------------------------- | ---------------- | ----------------- |
| Success | `success`                  | `success-subtle` | `success-content` |
| Warning | `warning`                  | `warning-subtle` | `warning-content` |
| Danger  | `danger` (= `destructive`) | `danger-subtle`  | `danger-content`  |
| Info    | `info`                     | `info-subtle`    | `info-content`    |

Prefer a label or icon with color. Logo violet (`#6C4BE8`) stays available as a
rare secondary highlight, not the main interactive color.

### Strong text on tints

`destructive` and `warning` are tuned for fills and icons; as 11–12px text on a
subtle tint they fall under 4.5:1. Use the strong variants for small text
(errors, “Overdue”, “Due soon”, character limits).

| Token            | Light                 | Dark                 | Contrast (light / dark)      |
| ---------------- | --------------------- | -------------------- | ---------------------------- |
| `danger-strong`  | `oklch(0.5 0.19 25)`  | `oklch(0.8 0.12 22)` | 5.8 / 7.0 on `danger-subtle` |
| `warning-strong` | `oklch(0.52 0.14 55)` | `oklch(0.8 0.12 70)` | 5.5 / 7.7 on `card`          |

## Incident workflow statuses

Each board column has its own hue so the icon reads at a glance in both themes.
They are icon colors (3:1 non-text minimum); labels stay `foreground`.

| Status      | Token             | Light                  | Dark                   |
| ----------- | ----------------- | ---------------------- | ---------------------- |
| Pending     | `status-pending`  | `oklch(0.55 0.01 60)`  | `oklch(0.68 0.01 270)` |
| In progress | `status-progress` | `oklch(0.55 0.17 260)` | `oklch(0.7 0.14 260)`  |
| Done        | `status-done`     | `oklch(0.55 0.14 156)` | `oklch(0.74 0.15 156)` |

Use them through `STATUS_BY_ID[status].tone` (`text-status-*`).

## People and board surfaces

| Token               | Light                   | Dark                   | Purpose                                                         |
| ------------------- | ----------------------- | ---------------------- | --------------------------------------------------------------- |
| `avatar`            | `oklch(0.92 0.035 269)` | `oklch(0.36 0.06 269)` | Initials background                                             |
| `avatar-foreground` | `oklch(0.42 0.13 269)`  | `oklch(0.9 0.05 269)`  | Initials (6.9:1 light, 8.1:1 dark)                              |
| `board-column`      | `oklch(0.951 0.007 85)` | `oklch(0.2 0.005 271)` | Column lane; darker than `card` in dark so cards read as raised |

## Priority card bands

Kanban ID tabs share one muted ladder (`priority-band-5`…`1`) with a shared
`priority-band-foreground` cream. Hues shift slightly (rose → clay → indigo →
stone → mist) at similar lightness/chroma so severity reads without neon fills.

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

Keep [`src/index.css`](../src/index.css) and this doc in sync. Primary accent is
**Indigo bridge** `#4560C8`. Prefer semantic utilities over raw color literals.
