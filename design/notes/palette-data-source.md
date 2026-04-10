# Palette Data Source Concept

## Example Input

```ts
const paletteSource = {
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
} as const;
```

## Expected Output

```ts
const { tokens, toCSS } = buildPaletteTokens(paletteSource);

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
