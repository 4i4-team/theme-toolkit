# Delivery: Scoped Variables (MFE)

Vanilla TypeScript — two micro-frontends on one page with isolated CSS variable scopes.

## What to look for

- **`src/theme.ts`** — two `createTheme` calls with different `scope` options: `createCssAdapter({ scope: "host" })` and `createCssAdapter({ scope: "widget" })`.
- **`src/main.ts`** — both MFEs inject their CSS on the same page. `--host-*` and `--widget-*` variables never collide.
- **Same raw theme, different scope** — both MFEs use the same design tokens but namespaced differently.
- **When to use** — micro-frontend architectures where multiple independent apps share a page and must not interfere with each other's CSS variables.

## Run

```bash
npm install
npm run dev
```
