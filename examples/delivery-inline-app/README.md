# Delivery: Inline Values

Vanilla TypeScript — resolved values baked into declarations, no CSS variables.

## What to look for

- **`src/theme.ts`** — `createCssAdapter({ inline: true })` passed to `createTheme`.
- **`src/main.ts`** — `theme.css` has no `:root` block. All rules use resolved values directly: `background: #4dabf7` instead of `background: var(--app-colors-primary)`. Side-by-side comparison with default output.
- **No `var(--)` anywhere** — inspect the generated CSS to confirm.
- **When to use** — email templates (email clients don't support CSS variables), static HTML exports, legacy browser support, or any environment where `var(--)` is not available.

## Run

```bash
npm install
npm run dev
```
