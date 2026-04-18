# Layout Example

Vanilla TypeScript — no framework, no styled-components.

## What to look for

- **`src/theme.ts`** — layout definition with `spacing`, `gutters`, `aspectRatio` (PropertyValue properties), `container` (3 modes: fixed/fluid/custom), `columns`, `grids`, and `stacks`.
- **`src/main.ts`** — renders spacing/gutter token swatches, container mode demos, column span utilities, grid presets, stack presets, and layout recipe demos.
- **Container modes** — `"fixed"` auto-generates `@media` max-width stepping per breakpoint; `"fluid"` is 100% width; custom values pass through. Each supports `inset`, `gutter`, `direction`, `align`, `justify`, `maxWidth`.
- **Gap references** — grids, stacks, and containers reference spacing tokens via `var(--prefix-layout-spacing--variant)`, so responsive spacing changes cascade automatically.
- **Columns/grids/stacks** — generate utility classes (span/offset for columns, CSS Grid presets for grids, flexbox presets for stacks).

## Run

```bash
npm install
npm run dev
```
