# Delivery: Per-Component (PrimeNG Style)

Vanilla TypeScript — no global CSS, each component carries its own styles.

## What to look for

- **`src/theme.ts`** — one `createTheme` call, default adapter. No `theme.css` injection.
- **`src/main.ts`** — `mountComponent` / `unmountComponent` functions. Each component calls `theme.components.renderRecipe(group, variant)` to get its CSS bundle (variables + rules), injects a `<style>` tag on mount, removes it on unmount.
- **Self-contained CSS** — each component's `<style>` tag includes only the variables it references. No global `:root` dump.
- **Mount/unmount demo** — click buttons to mount and unmount components. Watch `<style>` tags appear and disappear.
- **When to use** — component libraries, widget systems, or any setup where components must be self-contained. Each component pays only for its own CSS.

## Run

```bash
npm install
npm run dev
```
