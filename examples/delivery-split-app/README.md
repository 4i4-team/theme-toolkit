# Delivery: Split Variables / Rules

Vanilla TypeScript — variables global, recipes lazy-loaded per route.

## What to look for

- **`src/theme.ts`** — one `createTheme` call, default adapter.
- **`src/main.ts`** — `theme.variablesCss` injected at app root. Recipe CSS injected per "route" using `renderRecipe(group, variant, { includeVariables: false })`.
- **`includeVariables: false`** — the key option. Variables are already global, so per-route recipe CSS skips them to avoid duplication.
- **Route simulation** — click tabs to see recipe `<style>` tags injected on first visit.
- **When to use** — apps with many routes where not all recipe CSS is needed upfront. Variables are tiny and always needed; rules can be code-split.

## Run

```bash
npm install
npm run dev
```
