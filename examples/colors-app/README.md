# Colors Example

Vanilla TypeScript — no framework, no styled-components.

## What to look for

- **`src/theme.ts`** — raw color definitions with `base`, `text`, `variants`, `steps` (auto-generated light/dark variants), and recipe groups (`solid`, `outline`).
- **`src/main.ts`** — renders palette swatches for base + step variants, recipe buttons using `theme.colors.getClass()`, and the full generated CSS output.
- **Step generation** — shows how `steps` with `lightenBy`/`darkenBy` auto-generate color variants from the base.
- **Recipe classes** — buttons styled entirely via CSS class names (`theme.colors.classes`).
- **CSS variable output** — inspect the generated `theme.css` to see the `--prefix-colors-*` naming pattern.

## Run

```bash
npm install
npm run dev
```
