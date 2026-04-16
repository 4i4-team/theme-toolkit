# Palette Data Source Concept

## Example Input

```ts
const palette = {
  primary: {
    base: '#2251ff',
    text: '#ffffff',
    variants: {
      dark: '#1a3fcc',
      100: '#eef3ff',
    },
  },
  secondary: {
    base: '#ff8a00',
    text: '#1d1d1f',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    lightenBy: 8,
    darkenBy: 10,
  },
  neutral: {
    base: '#1f2533',
    text: '#ffffff',
    algorithm: (base, step) => customNeutralGenerator(base, step),
  },
} as const satisfies PaletteCollection<'primary' | 'secondary' | 'neutral'>;
```

## Expected Output

```ts
const { tokens, toCSS } = buildPaletteTokens(palette);

// JS tokens for programmatic theme use
const primaryDark = tokens.primary.variants.dark;   // '#1a3fcc'
const primary100 = tokens.primary.variants['100'];  // '#eef3ff' (override)
const primary200 = tokens.primary.variants['200'];  // auto-generated
const secondary500 = tokens.secondary.variants['500']; // base color
const secondary600 = tokens.secondary.variants['600']; // base darkened by 10%

// CSS variable export
const cssVariables = toCSS();
/*
  --color--primary--50, --color--primary--100, ...
  --text--primary, --color--secondary--600, ... etc.
*/
```

## Palette Recipes
`createTheme` can also consume color recipes so you can describe reusable background/text/border combinations once and re-use them as CSS classes.

```ts
const theme = createTheme({
  breakpoints: DEFAULT_BREAKPOINTS,
  palette,
  paletteRecipes: {
    surfaces: {
      subtle: {
        background: "neutral.light",
        color: "neutral.text",
        borderColor: "neutral.dark",
      },
      brand: {
        background: "primary",
        color: "primary.text",
        borderColor: "primary.dark",
        responsive: [{ breakpoint: "md", color: "accent" }],
      },
    },
  },
});

const surfaceClass = theme.colors.recipes.getClass("surfaces", "brand");
// -> "dt-color-surfaces-brand" (matches the selector inside `theme.colors.recipes.css`)
```

Recipe entries can reference palette tokens via `paletteKey.variant` shorthands (`primary`, `primary.dark`, `primary.text`, `neutral.light`, etc.). Any value that does not match a palette key is treated as a literal CSS value (`transparent`, `var(--brand-color--primary)`, `#fff`, etc.).

At runtime the theme exposes everything under `theme.colors`:

- `theme.colors.tokens` – JS tokens for programmatic use.
- `theme.colors.css` – palette CSS variables ready to drop into `createGlobalStyle`.
- `theme.colors.recipes.css` – generated recipe classes for global injection.
- `theme.colors.recipes.classes[group][variant]` – sanitized class names for every recipe.
- `theme.colors.recipes.getClass(group, variant)` – convenience helper that returns the class for a specific recipe or `undefined` if it does not exist.
- `theme.colors.recipes.styles[group][variant]` – resolved `{ base, responsive }` instructions if you prefer to consume the styles directly instead of using prebuilt classes.

The palette options accept an optional `classPrefix` (defaults to `dt-color`) if you want to namespace the generated selectors: `createTheme(..., { palette: { prefix: "--brand", classPrefix: "brand-color" } })`.
