# Effects Subsystem

Transforms raw effect definitions into CSS custom properties and recipe class names. Handles visual effects: border radius, shadows, blur, z-index, opacity, outlines, border widths, and transitions.

**Files:** `src/subsystems/effects/` — `index.ts`, `types.ts`, `tokens.ts`, `recipes.ts`, `theme.ts`.

---

## Raw input

Effects lives under `rawTheme.effects`. Eight properties, each `PropertyValue`-shaped:

```ts
createTheme({
  breakpoints: { sm: 576, md: 768, lg: 1024 },
  effects: {
    radius: {
      base: 4,
      variants: { none: 0, sm: 2, lg: 8, xl: 16, full: "9999px" },
    },
    shadow: {
      base: "0 1px 3px rgba(0,0,0,0.12)",
      variants: {
        none: "none",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
      },
    },
    blur: { base: 0, variants: { sm: 4, md: 8, lg: 16 } },
    zIndex: { base: 0, variants: { dropdown: 1000, modal: 1100, tooltip: 1200, toast: 1300 } },
    opacity: { base: 1, variants: { disabled: 0.5, muted: 0.7, ghost: 0.3, hidden: 0 } },
    outline: {
      base: "2px solid currentColor",
      variants: { none: "none", ring: "2px solid #4dabf7", thick: "3px solid currentColor" },
    },
    borderWidth: { base: 1, variants: { none: 0, thick: 2, heavy: 4 } },
    transitions: {
      base: "all 150ms ease",
      variants: { fast: "all 100ms ease", slow: "all 300ms ease", none: "none" },
    },
    recipes: {
      card: {
        default: { borderRadius: "base", boxShadow: "base" },
        elevated: { borderRadius: "lg", boxShadow: "lg" },
      },
      focus: {
        ring: { outline: "ring" },
      },
    },
  },
}, { effects: { prefix: "brand" } });
```

---

## Properties

| Property | Value type | Base | Description |
|---|---|---|---|
| **radius** | `number \| string` | `4` | Border radius. Numbers formatted as `px`. |
| **shadow** | `string` | `"0 1px 3px ..."` | Box shadow values. |
| **blur** | `number \| string` | `0` | Filter blur. Numbers formatted as `px`. |
| **zIndex** | `number` | `0` | Z-index scale. |
| **opacity** | `number` | `1` | Opacity (0–1 float). |
| **outline** | `string` | `"2px solid currentColor"` | Outline/ring styling. |
| **borderWidth** | `number` | `1` | Border width. Numbers formatted as `px`. |
| **transitions** | `string` | `"all 150ms ease"` | Transition shorthand. |

Each property supports the full `PropertyValue` contract: `base`, `variants`, `responsive`.

---

## Recipes

Recipes compose effect tokens into reusable CSS classes:

```ts
recipes: {
  card: {
    default: { borderRadius: "base", boxShadow: "base", transition: "base" },
    elevated: { borderRadius: "lg", boxShadow: "lg" },
  },
  focus: { ring: { outline: "ring" } },
  state: { disabled: { opacity: "disabled" } },
}
```

### Recipe prop → CSS output

| Recipe prop | CSS property | Resolves to |
|---|---|---|
| `borderRadius` | `border-radius` | `var(--prefix-effects-radius--variant)` |
| `boxShadow` | `box-shadow` | `var(--prefix-effects-shadow--variant)` |
| `opacity` | `opacity` | `var(--prefix-effects-opacity--variant)` |
| `outline` | `outline` | `var(--prefix-effects-outline--variant)` |
| `borderWidth` | `border-width` | `var(--prefix-effects-border-width--variant)` |
| `blur` | `filter` | `blur(var(--prefix-effects-blur--variant))` |
| `transition` | `transition` | `var(--prefix-effects-transition--variant)` |
| `zIndex` | `z-index` | `var(--prefix-effects-z-index--variant)` |

---

## Output shape

```ts
theme.effects.radius          // raw passthrough
theme.effects.shadow          // raw passthrough
theme.effects.recipes         // raw passthrough
theme.effects.tokens          // computed
theme.effects.variables       // computed: CssVariablesNode[]
theme.effects.nodes           // computed: CssNode[]
theme.effects.classes         // computed: { card: { default: "brand-card-default" } }
theme.effects.getClass(g, v)  // computed
```

---

## CSS variable naming

With `prefix: "brand"`:

| Source | CSS Variable |
|---|---|
| radius lg | `--brand-effects-radius--lg` |
| shadow lg | `--brand-effects-shadow--lg` |
| opacity disabled | `--brand-effects-opacity--disabled` |
| zIndex modal | `--brand-effects-z-index--modal` |
| outline ring | `--brand-effects-outline--ring` |
| borderWidth thick | `--brand-effects-border-width--thick` |
| transitions fast | `--brand-effects-transition--fast` |

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `prefix` | `string` | `"dt"` | CSS variable prefix. |
| `classPrefix` | `string` | `"dt-fx"` | Recipe class prefix. |

---

## Helper hooks

| Hook | What it does |
|---|---|
| `tokenizeProperty` | Builds `{ base, variants }` from normalized property. |
| `mapCssVariables` | Custom naming: `--prefix-effects-{property}--{variant}`. Formats radius/borderWidth/blur as px. |
| `interpretRecipe` | Resolves recipe props to `var(--)`. Wraps blur in `blur()` filter function. |
