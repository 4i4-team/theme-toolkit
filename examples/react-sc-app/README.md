# React + styled-components Example

React + Vite + styled-components — demonstrates all SC adapter integration patterns.

## What to look for

- **`src/theme.ts`** — passes `adapter: createStyledComponentsAdapter()` to `createTheme`. This enables SC media templates on `theme.media`.
- **`src/main.tsx`** — `ThemeProvider` wraps the app, `GlobalStyles` injects `theme.css` via `createGlobalStyle`.
- **`src/styled.d.ts`** — `DefaultTheme` augmentation so SC interpolations are typed.
- **`src/components/`** — each styled component in its own file.

### Three integration patterns

1. **CSS variables** (`Card.ts`, `Badge.ts`) — reference `var(--app-effects-radius--lg)`, `var(--app-colors-primary)` directly in template literals.
2. **Direct token access** (`TokenDemo.ts`) — read `theme.colors.tokens.primary.base`, `theme.typography.tokens.fontSize.variants.lg` in SC interpolations for raw values.
3. **Recipe class names** (`App.tsx` buttons) — `className={theme.components.getClass("buttons", "primary")}` on styled or plain elements.

### SC adapters

- **Media templates** (`ResponsiveDemo.ts`, `TokenDemo.ts`) — `theme.media.md.min\`...\`` tagged template functions for responsive styles.
- **Typography mixin** (`Typography.ts` headings) — `typographyMixin(tokens, prefix, group, variant, recipes)` generates a complete `css` block from a typography recipe.
- **`theme.typography.style()`** (`Button.ts`) — returns a plain JS style object from a typography recipe, used in SC interpolations.

## Run

```bash
npm install
npm run dev
```
