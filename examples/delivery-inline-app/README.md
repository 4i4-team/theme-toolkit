# Delivery: Inline Styles

Vanilla TypeScript — style objects applied directly on elements, no CSS classes or variables.

## What to look for

- **`src/theme.ts`** — `createCssAdapter({ inline: true })` passed to `createTheme`.
- **`src/main.ts`** — `renderRecipe(group, variant, { inline: true })` returns a style object (`{ background: "#4dabf7", color: "#fff" }`), not a CSS string. Applied via `style` attribute.
- **No `<style>` tags for theme** — all styling is inline on elements.
- **Side-by-side comparison** — shows inline style object vs default CSS string from the same recipe.
- **When to use** — email templates (no `<style>` support), React Native (`StyleSheet.create`), server-rendered snippets, Canvas/PDF rendering.

## Run

```bash
npm install
npm run dev
```
