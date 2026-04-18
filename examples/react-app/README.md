# React Example (bare, no styled-components)

React + Vite — CSS classes only, no CSS-in-JS library.

## What to look for

- **`src/main.tsx`** — injects `theme.css` via a `<style>` element. No `ThemeProvider`, no `createGlobalStyle`.
- **`src/App.tsx`** — all styling via `className` attributes using `theme.components.getClass()`, `theme.typography.getClass()`, and `theme.colors.getClass()`.
- **Components tab** — composed buttons, cards, and badges using the components subsystem. Each element has a single `className` string that includes referenced subsystem classes + delta class.
- **Typography tab** — headings and body text styled via typography recipe classes.
- **Tokens tab** — expandable accordion showing raw computed tokens and the full generated CSS.
- **No adapter, no CSS-in-JS dependency** — uses the default `createTheme()` with no `adapter` option. Demonstrates that the toolkit works standalone with plain CSS strings and class names. The same pattern works with any framework (Angular, Vue, Svelte, plain HTML).

## Run

```bash
npm install
npm run dev
```
