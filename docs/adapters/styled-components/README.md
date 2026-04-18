# styled-components Adapter

Framework-specific wrappers that bridge theme-kit's output into styled-components idioms: tagged-template media queries, typography mixins, and `DefaultTheme` augmentation.

**Files:** `src/adapters/styled-components/` — `media.ts`, `typography.ts`, `types.ts`.

---

## Setup

### 1. Inject theme CSS

`theme.css` contains all generated CSS custom properties and recipe classes. Inject it once via `createGlobalStyle`:

```tsx
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

const GlobalStyles = createGlobalStyle`
  ${theme.css}
`;
```

### 2. Provide the theme

Pass the theme object to `ThemeProvider` so styled-components can access it:

```tsx
import { ThemeProvider } from "styled-components";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {/* ... */}
    </ThemeProvider>
  );
}
```

### 3. Augment DefaultTheme

Create a `styled.d.ts` file so TypeScript knows the shape of `theme` inside styled-components interpolations:

```ts
// src/styled.d.ts
import "styled-components";
import type { theme } from "./theme";

type AppTheme = typeof theme;

declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
```

---

## Media templates

`theme.media` provides SC-wrapped media query helpers that return tagged-template functions. Instead of writing raw `@media` strings, use them directly in styled-components:

### Breakpoint groups

Each breakpoint exposes `.min`, `.max`, and `.exact` template functions:

```ts
import styled from "styled-components";

const Box = styled.div`
  padding: 16px;

  ${({ theme }) => theme.media.md.min`
    padding: 24px;
  `}

  ${({ theme }) => theme.media.lg.min`
    padding: 32px;
  `}
`;
```

Generated CSS:

```css
.sc-xxx {
  padding: 16px;
}

@media (min-width: 768px) {
  .sc-xxx { padding: 24px; }
}

@media (min-width: 1024px) {
  .sc-xxx { padding: 32px; }
}
```

### Callable helpers

For dynamic breakpoint selection or combining breakpoints:

```ts
const Sidebar = styled.aside`
  display: none;

  ${({ theme }) => theme.media.min("md")`
    display: block;
    width: 240px;
  `}
`;

const TabletOnly = styled.div`
  display: none;

  ${({ theme }) => theme.media.between("sm", "lg")`
    display: block;
  `}
`;
```

### Available variants

| Variant | Query | Example output |
|---|---|---|
| `.min` | `min-width` | `@media (min-width: 768px)` |
| `.max` | `max-width` | `@media (max-width: 1023.98px)` |
| `.exact` | `min-width` + `max-width` | `@media (min-width: 768px) and (max-width: 1023.98px)` |

### Orientation

Pass an `orientation` option to any callable:

```ts
${({ theme }) => theme.media.min("md", { orientation: "landscape" })`
  /* landscape tablets and up */
`}
```

### Accessing the raw query string

Each template function has a `.query` property with the raw media query string:

```ts
theme.media.md.min.query  // "@media (min-width: 768px)"
theme.media.lg.exact.query  // "@media (min-width: 1024px) and (max-width: 1279.98px)"
```

### Standalone breakpoint

Create a one-off media group without a full theme:

```ts
import { breakpoint } from "@4i4/theme-toolkit";

const tablet = breakpoint({ min: 768, max: 1024 });

const Box = styled.div`
  ${tablet.min`
    padding: 24px;
  `}
`;
```

---

## Typography mixin

`typographyMixin` generates a complete typography `css` block from a recipe definition. It reads the recipe's property references and emits `var(--...)` declarations:

```ts
import styled from "styled-components";
import { typographyMixin } from "@4i4/theme-toolkit";

const Heading = styled.h1`
  ${({ theme }) =>
    typographyMixin(
      theme.typography.tokens,  // token map
      "app",                    // CSS variable prefix
      "heading",                // recipe group
      "h1",                     // recipe variant
      theme.typography.recipes, // recipe definitions
    )}
`;
```

Generated CSS:

```css
.sc-xxx {
  font-family: var(--app-font-family--heading);
  font-size: var(--app-font-size--3xl);
  font-weight: var(--app-font-weight--bold);
  line-height: var(--app-line-height--tight);
  letter-spacing: var(--app-letter-spacing--tight);
}
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `tokens` | `TypographyTokens` | `theme.typography.tokens` |
| `prefix` | `string` | CSS variable prefix (must match the one passed to `createTheme`) |
| `group` | `string` | Recipe group name |
| `variant` | `string` | Recipe variant name |
| `recipes` | `Record<...>` | `theme.typography.recipes` |

### When to use

- **`typographyMixin`** — when you want a complete SC `css` block for a recipe, ready to drop into a styled component. Returns a styled-components `css` interpolation.
- **`theme.typography.style(group, variant)`** — when you want a plain JS object (`{ "font-size": "var(--...)", ... }`) for use in SC interpolations or inline styles. Framework-neutral.
- **CSS variables directly** — when you only need one or two properties: `font-size: var(--app-typography-font-size--lg)`.

---

## ThemeAugmentation

`ThemeAugmentation` is a TypeScript interface describing the shape of the theme object inside styled-components. It covers `media`, `css`, `nodes`, `colors`, `typography`, and `layout` slices.

Use it if you want a pre-built interface instead of inferring from `typeof theme`:

```ts
import "styled-components";
import type { ThemeAugmentation } from "@4i4/theme-toolkit";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeAugmentation {}
}
```

> **Note:** `typeof theme` (from your own `createTheme` call) is more precise — it carries your specific breakpoint names, palette keys, and subsystem shapes. `ThemeAugmentation` is a looser fallback for quick setup.

---

## Three integration patterns

The adapter supports three ways to consume theme data in styled-components. Mix them as needed:

### 1. CSS variables

Reference generated custom properties directly in template literals:

```ts
const Card = styled.div`
  border-radius: var(--app-effects-radius--lg);
  box-shadow: var(--app-effects-shadow--lg);
  padding: var(--app-layout-spacing--xl);
`;
```

### 2. Direct token access

Read token values from the theme object in SC interpolations:

```ts
const Hero = styled.div`
  background: ${({ theme }) => theme.colors.tokens.primary.base};
  font-size: ${({ theme }) => `${theme.typography.tokens.fontSize.variants.xl}px`};
`;
```

### 3. Recipe class names

Apply composed component classes via `className`:

```tsx
<button className={theme.components.getClass("buttons", "primary")}>
  Click me
</button>
```

Or combine with styled-components:

```ts
const StyledButton = styled.button`
  /* additional SC-specific styles */
  &:hover { opacity: 0.9; }
`;

// In JSX:
<StyledButton className={theme.components.getClass("buttons", "primary")} />
```

---

## Exports

| Export | Type | Description |
|---|---|---|
| `media(breakpoints, config?)` | function | Creates SC-wrapped media descriptor |
| `breakpoint({ min?, max?, config? })` | function | Creates standalone media group |
| `wrapMediaDescriptor(descriptor)` | function | Wraps a plain `MediaDescriptor` for SC |
| `wrapMediaGroup(group)` | function | Wraps a single `MediaGroupDescriptor` |
| `typographyMixin(tokens, prefix, group, variant, recipes?)` | function | SC `css` block from typography recipe |
| `ThemeAugmentation` | interface | SC `DefaultTheme` shape |
| `WrappedMediaDescriptor<T>` | type | SC media descriptor type |
| `WrappedMediaGroup` | type | SC media group type (min/max/exact) |
| `MediaHelpers<T>` | type | Alias for `WrappedMediaDescriptor<T>` |
| `MediaGroup` | type | Alias for `WrappedMediaGroup` |
| `ThemeWithMedia<T>` | type | `{ readonly media: MediaHelpers<T> }` |
