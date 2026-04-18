# Typography Subsystem

Transforms raw typography definitions into normalized tokens, CSS custom properties, and recipe class names. Follows the same `PropertyValue`-based pattern as the colors subsystem.

**Files:** `src/subsystems/typography/` — `index.ts`, `types.ts`, `normalize.ts`, `tokens.ts`, `recipes.ts`, `theme.ts`.

---

## Raw input

Typography lives under `rawTheme.typography`. Nine properties, each `PropertyValue`-shaped with base + variants:

```ts
createTheme({
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  typography: {
    fontFamily: {
      base: "Inter, sans-serif",
      variants: { heading: "Inter, sans-serif", mono: "IBM Plex Mono, monospace" },
    },
    fontSize: {
      base: 16,
      ratio: "major-third",      // auto-generates scale variants (xs → 4xl)
    },
    fontWeight: {
      base: 400,
      variants: { medium: 500, semibold: 600, bold: 700 },
    },
    lineHeight: {
      base: 1.5,
      variants: { tight: 1.2, relaxed: 1.8 },
    },
    letterSpacing: {
      base: "0",
      variants: { tighter: "-0.02em", wide: "0.02em" },
    },
    fontStyle: {
      base: "normal",
      variants: { italic: "italic" },
    },
    textTransform: {
      base: "none",
      variants: { uppercase: "uppercase", capitalize: "capitalize", lowercase: "lowercase" },
    },
    textDecoration: {
      base: "none",
      variants: { underline: "underline", lineThrough: "line-through" },
    },
    textAlign: {
      base: "left",
      variants: { right: "right", center: "center", justify: "justify" },
    },
    recipes: {
      body: {
        md: { fontFamily: "base", fontSize: "md", fontWeight: "base", lineHeight: "base", letterSpacing: "base" },
      },
      heading: {
        xl: {
          fontFamily: "heading", fontSize: "xl", fontWeight: "semibold",
          lineHeight: "tight", letterSpacing: "tighter",
          responsive: [{ breakpoint: "lg", fontSize: "2xl", fontWeight: "bold" }],
        },
      },
    },
  },
}, { typography: { unit: "rem", prefix: "brand" } });
```

---

## Properties

| Property | Value type | Base | Description |
|---|---|---|---|
| **fontFamily** | `string` | `"Inter, sans-serif"` | Font family stacks |
| **fontSize** | `number` | `16` | Base font size in px. Supports `ratio` for auto-scale. |
| **fontWeight** | `number` | `400` | Font weights |
| **lineHeight** | `number` | `1.5` | Unitless line height |
| **letterSpacing** | `string` | `"0"` | Letter spacing with unit |
| **fontStyle** | `string` | `"normal"` | Font style |
| **textTransform** | `string` | `"none"` | Text transform |
| **textDecoration** | `string` | `"none"` | Text decoration |
| **textAlign** | `string` | `"left"` | Text alignment |

Each property supports the full `PropertyValue` contract: `base`, `variants`, `responsive`.

---

## fontSize scale generation

`ratio` is **optional**. Without it, fontSize works like any other property — just base + explicit variants:

```ts
// No scale — explicit variants only
fontSize: { base: 16, variants: { sm: 14, lg: 20, xl: 24 } }

// Or just a primitive
fontSize: 16
```

When `ratio` is set, fontSize auto-generates scale variants during normalization:

```ts
fontSize: {
  base: 16,
  ratio: "major-third",    // 1.25 multiplier
}
// Generates: xs (10.24), sm (12.8), md (16), lg (20), xl (25), 2xl (31.25), 3xl (39.06), 4xl (48.83)
```

### Available ratios

| Ratio | Multiplier |
|---|---|
| `minor-second` | 1.067 |
| `major-second` | 1.125 |
| `minor-third` | 1.2 |
| `major-third` | 1.25 |
| `perfect-fourth` | 1.333 |
| `augmented-fourth` | 1.414 |
| `perfect-fifth` | 1.5 |
| `golden` | 1.618 |

### Extra fields on fontSize

| Field | Type | Default | Description |
|---|---|---|---|
| `ratio` | `TypographyRatioKey` | — | Scale ratio. When set, generates xs→4xl variants. |
| `precision` | `number` | `4` | Decimal precision for computed values. |
| `baseFontSize` | `number` | same as `base` | Base used for ratio computation (if different from `base`). |
| `algorithm` | `(base, key, step, prev) => number` | — | Custom scale algorithm. Overrides ratio-based computation. |

User-defined fontSize variants override scale-generated ones.

---

## Responsive

All typography properties support responsive overrides:

```ts
fontWeight: {
  base: 400,
  variants: { bold: 700 },
  responsive: [
    { breakpoint: "lg", variant: "bold" },     // swap to bold at lg
    { breakpoint: "sm", query: "max", base: 300 }, // lighter on small screens
  ],
}
```

Same responsive model as colors: `variant` (swap flow), `target` (scope to variant), `orientation`, breakpoint validation.

---

## Recipes

Recipes define reusable typography combinations as CSS classes. Each recipe property references a variant name from one of the nine typography properties:

```ts
recipes: {
  heading: {
    xl: {
      fontFamily: "heading",         // → var(--prefix-font-family--heading)
      fontSize: "xl",                // → var(--prefix-font-size--xl)
      fontWeight: "semibold",        // → var(--prefix-font-weight--semibold)
      lineHeight: "tight",           // → var(--prefix-line-height--tight)
      letterSpacing: "tighter",      // → var(--prefix-letter-spacing--tighter)
      responsive: [
        { breakpoint: "lg", fontSize: "2xl", fontWeight: "bold" },
      ],
    },
  },
}
```

### Generated CSS

```css
.brand-heading-xl {
  font-family: var(--brand-font-family--heading);
  font-size: var(--brand-font-size--xl);
  font-weight: var(--brand-font-weight--semibold);
  line-height: var(--brand-line-height--tight);
  letter-spacing: var(--brand-letter-spacing--tighter);
}

@media (min-width: 1024px) {
  .brand-heading-xl {
    font-size: var(--brand-font-size--2xl);
    font-weight: var(--brand-font-weight--bold);
  }
}
```

---

## Output shape

`theme.typography` is the raw input enhanced with computed getters:

```ts
theme.typography.fontFamily            // raw passthrough
theme.typography.fontSize              // raw passthrough (with ratio)
theme.typography.fontWeight            // raw passthrough
// ... all 9 properties ...
theme.typography.recipes               // raw passthrough (recipe definitions)

theme.typography.tokens                // computed: { fontFamily: { base, variants }, fontSize: { base, variants: { xs..4xl } }, ... }
theme.typography.variables             // computed: CssVariablesNode[]
theme.typography.nodes                 // computed: CssNode[] (variables + recipe rules)
theme.typography.classes               // computed: { heading: { xl: "brand-heading-xl" } }
theme.typography.getClass(group, var)  // computed: fn → className | undefined
theme.typography.style(group, var)     // computed: fn → { font-family: "var(--...)", ... }
```

---

## CSS variable naming

With `prefix: "brand"`:

| Source | CSS Variable |
|---|---|
| fontFamily base | `--brand-font-family--base` |
| fontFamily heading | `--brand-font-family--heading` |
| fontSize xl | `--brand-font-size--xl` (with unit: `1.5625rem`) |
| fontWeight bold | `--brand-font-weight--bold` |
| lineHeight tight | `--brand-line-height--tight` |
| textAlign center | `--brand-text-align--center` |

---

## Options

Passed as `options.typography` to `createTheme`:

| Option | Type | Default | Description |
|---|---|---|---|
| `prefix` | `string` | `"dt"` | CSS variable prefix. |
| `unit` | `"px" \| "rem"` | `"px"` | Unit for fontSize values. When `"rem"`, values are divided by baseFontSize. |

---

## Helper hooks

The typography helper (`createTypographyThemeHelper`) declares these hooks:

| Hook | What it does |
|---|---|
| `normalizeProperty` | fontSize: generates scale variants (xs→4xl) from ratio during normalization. Other properties: passthrough. |
| `tokenizeProperty` | Builds `{ base, variants: { base, ...named } }` from normalized property. |
| `mapCssVariables` | Custom naming: `--prefix-css-property--variant`. Handles px/rem for fontSize. |
| `interpretRecipe` | Per-variant: resolves recipe refs to `var(--…)` strings. |
| `buildSlice` | Returns `style(group, variant)` utility that produces a plain style object with var refs. |
