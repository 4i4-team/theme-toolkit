# Delivery: Single Global CSS

Vanilla TypeScript — the simplest delivery strategy.

## What to look for

- **`src/theme.ts`** — one `createTheme` call, no adapter options (default).
- **`src/main.ts`** — injects `theme.css` as a single `<style>` tag at app root. All variables and recipe rules in one shot.
- **When to use** — most apps. Simple setup, no lazy loading needed, total CSS size is small.

## Run

```bash
npm install
npm run dev
```
