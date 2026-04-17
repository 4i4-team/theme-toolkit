# Colors Subsystem

Reference implementation of the subsystem pattern. Transforms raw color definitions into normalized tokens, CSS custom properties, and recipe class names.

**Files:** `src/subsystems/colors/` — `index.ts`, `types.ts`, `utils.ts`, `normalize.ts`, `tokens.ts`, `recipes.ts`, `theme.ts`.

---

## Raw input

Colors live under `rawTheme.colors`. Each property can be **primitive** or **extended**.

```ts
createTheme({
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  colors: {
    // Primitive — just a hex string, no text field
    surface: "#f8f9fa",

    // Extended — base + text + optional extras
    primary: {
      base: "#2251ff",
      text: "#ffffff",
    },

    // Extended with custom variants
    brand: {
      base: "#d0021b",
      text: "#ffffff",
      variants: {
        muted: { base: "#e8a0a8" },
      },
    },

    // Extended with numeric steps
    accent: {
      base: "#ff6600",
      text: "#1d1d1f",
      steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      baseStep: 500,
      lightenBy: 8,
      darkenBy: 12,
    },

    // Extended with responsive overrides
    neutral: {
      base: "#6c757d",
      text: "#ffffff",
      responsive: [
        { breakpoint: "sm", query: "max", base: "#555555" },
        { breakpoint: "lg", variant: "dark" },
      ],
    },

    // Recipes — nested under the same key
    recipes: {
      buttons: {
        solid:   { background: "primary", color: "primary.text" },
        outline: { background: "transparent", color: "primary", "border-color": "primary" },
      },
    },
  },
}, { palette: { prefix: "brand", classPrefix: "brand-color" } });
```

---

## Property fields

| Field | Type | Required | Description |
|---|---|---|---|
| `base` | `string` | yes | The base color value (hex). Implicit when using primitive form. |
| `text` | `string` | no | Foreground text color. When set, a `--prefix-text--name` CSS variable is emitted. |
| `variants` | `Record<string, string \| { base }>` | no | Named color variants. User-defined variants anchor the step progression. |
| `steps` | `Array<string \| number>` | no | Step names for auto-generated variants. Defaults to `["light", "lighter", "dark", "darker"]`. |
| `baseStep` | `string \| number` | no | Which step corresponds to the base color. Defaults to `"500"` (if in the list) or the middle step. |
| `lightenBy` | `number` | no | Percentage (0–100) to lighten per step. Default: `20`. |
| `darkenBy` | `number` | no | Percentage (0–100) to darken per step. Default: `20`. |
| `algorithm` | `(base, step) => string` | no | Custom color generator. Receives the previous step's color and the step name. |
| `responsive` | `Array<ResponsiveOverride>` | no | Breakpoint-scoped overrides. See [Responsive](#responsive). |

---

## Steps

Steps auto-generate color variants by progressively lightening or darkening from the base. Each step compounds from the **previous** step, not from the base.

### Default steps

When `steps` is not set, the defaults are `["light", "lighter", "dark", "darker"]`:

```
lighter ← lighten(light, 20%)
light   ← lighten(base, 20%)
main    = base
dark    ← darken(base, 20%)
darker  ← darken(dark, 20%)
```

### Numeric steps

```ts
accent: {
  base: "#ff6600",
  steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
  baseStep: 500,
  lightenBy: 8,
  darkenBy: 12,
}
```

- Steps are sorted numerically.
- `baseStep` (500) gets the base color.
- Steps below 500 lighten progressively: 400 = lighten(base, 8%), 300 = lighten(400, 8%), etc.
- Steps above 500 darken progressively: 600 = darken(base, 12%), 700 = darken(600, 12%), etc.

### User-defined variant anchors

If a `variants` entry matches a step name, that value is used as-is and the progression continues from it:

```ts
accent: {
  base: "#ff6600",
  steps: [300, 400, 500, 600, 700],
  baseStep: 500,
  lightenBy: 10,
  variants: {
    "400": { base: "#ff9944" },  // user-defined anchor
  },
}
// 300 = lighten("#ff9944", 10%)  ← compounds from the user-defined 400
// 400 = "#ff9944"                 ← user-defined
// 500 = "#ff6600"                 ← base
// 600, 700 = progressive darkening from base
```

---

## Responsive

Color properties support responsive overrides via the shared responsive model:

```ts
primary: {
  base: "#d0021b",
  text: "#ffffff",
  responsive: [
    // Plain override: swap base + text at small screens
    { breakpoint: "sm", query: "max", base: "#b00016", text: "#fefefe" },

    // Variant swap: at lg, base variable references the dark variant
    { breakpoint: "lg", variant: "dark" },

    // Target override: at lg, override the muted variant only
    { breakpoint: "lg", target: "muted", base: "#f0c0c5" },

    // With orientation
    { breakpoint: "md", query: "exact", orientation: "landscape", base: "#cc0018" },
  ],
}
```

Responsive entries can reference **step-generated variants** (e.g., `variant: "light"`) even when no explicit `light` variant is defined — steps are generated during normalization, before responsive refs are validated.

Output:
```css
@media (max-width: 767.98px) {
  :root { --brand-color--primary: #b00016; --brand-text--primary: #fefefe; }
}
@media (min-width: 1024px) {
  :root { --brand-color--primary: var(--brand-color--primary--dark); }
}
```

---

## Recipes

Recipes define reusable CSS class-based style compositions that reference palette tokens via `var(--...)`.

```ts
colors: {
  primary: { base: "#2251ff", text: "#ffffff" },
  accent:  { base: "#ff6600", text: "#1d1d1f" },
  recipes: {
    buttons: {
      solid:   { background: "primary", color: "primary.text" },
      outline: {
        background: "transparent",
        color: "primary",
        "border-color": "primary",
        responsive: [
          { breakpoint: "md", query: "min", color: "accent", "border-color": "accent" },
        ],
      },
    },
  },
}
```

### Reference syntax

Recipe property values are resolved against the palette tokens:

| Input | Output |
|---|---|
| `"primary"` | `var(--prefix-color--primary)` |
| `"primary.text"` | `var(--prefix-text--primary)` |
| `"primary.dark"` | `var(--prefix-color--primary--dark)` |
| `"transparent"` | `transparent` (literal — no matching palette name) |
| `"#fff"` | `#fff` (literal) |

### Generated CSS

```css
.brand-color-buttons-solid {
  background: var(--brand-color--primary);
  color: var(--brand-text--primary);
}
.brand-color-buttons-outline {
  background: transparent;
  color: var(--brand-color--primary);
  border-color: var(--brand-color--primary);
}
@media (min-width: 768px) {
  .brand-color-buttons-outline {
    color: var(--brand-color--accent);
    border-color: var(--brand-color--accent);
  }
}
```

---

## Output shape

`theme.colors` is the raw input **enhanced with computed getters**:

```ts
theme.colors.primary              // raw passthrough: { base: "#2251ff", text: "#ffffff", ... }
theme.colors.surface              // raw passthrough: "#f8f9fa"
theme.colors.recipes              // raw passthrough: { buttons: { solid: {...}, ... } }

theme.colors.tokens               // computed: { primary: { text, variants: { main, light, ... } } }
theme.colors.variables            // computed: CssVariablesNode[] (property variable IR)
theme.colors.nodes                // computed: CssNode[] (all IR: variables + recipe rules)
theme.colors.classes              // computed: { buttons: { solid: "brand-color-buttons-solid", ... } }
theme.colors.styles               // computed: interpreted recipe styles
theme.colors.getClass(group, var) // computed: fn → className | undefined
theme.colors.lighten(name, pct)   // computed: fn → hex string
theme.colors.darken(name, pct)    // computed: fn → hex string
```

---

## CSS variable naming

With `prefix: "brand"`:

| Source | CSS Variable |
|---|---|
| `primary` (base) | `--brand-color--primary` |
| `primary` (text) | `--brand-text--primary` |
| `primary` (variant `main`) | `--brand-color--primary--main` |
| `primary` (variant `dark`) | `--brand-color--primary--dark` |
| `accent` (step `700`) | `--brand-color--accent--700` |
| `surface` (primitive, base) | `--brand-color--surface` |

Prefix is normalized via `normalizeCssVariablePrefix`: `"brand"` → `"--brand"`, `"--brand"` → `"--brand"`.

---

## Options

Passed as `options.palette` to `createTheme`:

| Option | Type | Default | Description |
|---|---|---|---|
| `prefix` | `string` | `"dt"` | CSS variable prefix. Normalized to start with `--`. |
| `classPrefix` | `string` | `"dt-color"` | Recipe class name prefix. |

---

## Helper hooks

The colors helper (`createPaletteThemeHelper`) declares these hooks on the `SubsystemHelper` contract:

| Hook | What it does |
|---|---|
| `normalizeProperty` | Validates `text` (optional). Generates step variants via progressive lighten/darken and adds them to the variants map. Runs before responsive ref validation. |
| `tokenizeProperty` | Builds `{ text, variants: { main, light, dark, ... } }` from the normalized property. |
| `mapCssVariables` | Custom CSS variable naming: `--prefix-color--name`, `--prefix-text--name`, `--prefix-color--name--variant`. |
| `interpretRecipe` | Per-variant recipe interpreter. Resolves palette references to `var(--...)` strings. Handles responsive recipe entries + cross-variant references (via `resolveRecipeVariant`). |
| `buildSlice` | Returns `{ lighten, darken }` domain utilities. |
