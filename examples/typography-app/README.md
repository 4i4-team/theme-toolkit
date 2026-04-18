# Typography Example

Vanilla TypeScript — no framework, no styled-components.

## What to look for

- **`src/theme.ts`** — 9 typography properties (`fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, etc.) with base + variants, optional `ratio` for auto-generated fontSize scale, and recipe groups (`heading`, `body`, `button`, `code`).
- **`src/main.ts`** — renders type scale preview, font style variants, recipe text samples with `theme.typography.getClass()`.
- **Scale generation** — when `ratio` is set (e.g. `"major-third"`), fontSize variants (xs–4xl) are auto-generated during normalization. When omitted, fontSize works like any other property with explicit variants only.
- **Unit handling** — `options.typography.unit` controls whether fontSize emits `px` or `rem` in CSS variables.
- **Recipe classes** — text styled via CSS class names referencing `var(--prefix-*)` under the hood.

## Run

```bash
npm install
npm run dev
```
