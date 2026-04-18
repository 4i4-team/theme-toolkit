# Effects Example

Vanilla TypeScript — no framework, no styled-components.

## What to look for

- **`src/theme.ts`** — 8 effect properties (`radius`, `shadow`, `blur`, `zIndex`, `opacity`, `outline`, `borderWidth`, `transitions`) and recipe groups (`card`, `focus`, `state`).
- **`src/main.ts`** — renders swatches for radius, shadow, opacity, border width, and outline variants. Shows recipe demos for card styles, focus rings, and state effects.
- **Value formatting** — `radius`, `borderWidth`, and `blur` numbers are formatted as `px` in CSS variables. `blur` wraps in `blur()` filter function in recipes.
- **Recipe composition** — `{ borderRadius: "lg", boxShadow: "lg" }` resolves to `border-radius: var(--prefix-effects-radius--lg); box-shadow: var(--prefix-effects-shadow--lg)`.

## Run

```bash
npm install
npm run dev
```
