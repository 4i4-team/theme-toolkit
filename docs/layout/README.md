# Layout Subsystem

Transforms raw layout definitions into CSS custom properties, utility classes, and recipe class names. Handles spacing, gutters, aspect ratios, containers, columns, grids, stacks, and free-form layout recipes.

**Files:** `src/subsystems/layout/` — `index.ts`, `types.ts`, `utils.ts`, `normalize.ts`, `tokens.ts`, `recipes.ts`, `theme.ts`.

---

## Raw input

Layout lives under `rawTheme.layout` with 8 reserved keys:

```ts
createTheme({
  breakpoints: { xs: 0, sm: 576, md: 768, lg: 1024, xl: 1280 },
  layout: {
    // Properties (PropertyValue → CSS variables)
    spacing: {
      base: 16,
      variants: { none: 0, compact: 8, relaxed: 32 },
      responsive: [
        { breakpoint: "sm", target: "relaxed", base: 20 },
        { breakpoint: "lg", target: "relaxed", base: 40 },
      ],
    },
    gutters: {
      base: 16,
      variants: { compact: 8, relaxed: 32, loose: 48 },
    },
    aspectRatio: {
      base: "auto",
      variants: { square: "1", video: "16/9", portrait: "3/4" },
    },

    // Special properties (CSS variables + utility classes)
    container: {
      base: "fixed",
      inset: "base",
      gutter: "base",
      direction: "column",
      responsive: [
        { breakpoint: "md", direction: "row", align: "center" },
      ],
      variants: {
        narrow: { base: "fixed", maxWidth: "md" },
        wide: { base: "fluid", maxWidth: 1600, inset: "relaxed" },
        full: { base: "fluid" },
      },
    },
    columns: 12,

    // Special presets (utility classes)
    grids: {
      cards: { templateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "relaxed" },
      feature: {
        templateColumns: "repeat(3, 1fr)", gap: "base",
        responsive: [{ breakpoint: "md", templateColumns: "repeat(2, 1fr)" }],
      },
    },
    stacks: {
      vertical: { direction: "column", gap: "relaxed" },
      horizontal: { direction: "row", gap: "compact", responsive: [{ breakpoint: "sm", direction: "column" }] },
    },

    // Free-form recipes
    recipes: {
      section: {
        hero: { paddingY: "relaxed", paddingX: "relaxed" },
        block: { paddingY: "compact", paddingX: "relaxed" },
      },
    },
  },
}, { layout: { prefix: "brand", classPrefix: "brand" } });
```

---

## Reserved keys

| Key | Kind | Produces |
|---|---|---|
| `spacing` | property | CSS variables (`--prefix-layout-spacing--*`) |
| `gutters` | property | CSS variables (`--prefix-layout-gutters--*`) |
| `aspectRatio` | property | CSS variables (`--prefix-layout-aspect-ratio--*`) |
| `container` | special property | CSS variables + container utility classes |
| `columns` | special property | CSS variables + column span/offset utility classes |
| `grids` | special property | Grid layout utility classes |
| `stacks` | special property | Flexbox stack utility classes |
| `recipes` | free-form | Layout recipe classes (padding, margin, gap) |

---

## Properties

### spacing

`PropertyValue<number>` — base spacing + named variants.

```ts
spacing: { base: 16, variants: { none: 0, compact: 8, relaxed: 32 } }
// or primitive: spacing: 16
```

- `none: 0` is always forced (even if user defines a different value).
- Supports responsive overrides with `target` to change specific variants at breakpoints.
- Values formatted as `px` in CSS variables.

### gutters

Same shape as spacing. Used for grid/container gap values.

### aspectRatio

`PropertyValue<string>` — named aspect ratio presets.

```ts
aspectRatio: { base: "auto", variants: { square: "1", video: "16/9" } }
```

---

## Container

`PropertyValue<string, ContainerExtras>` — the most feature-rich layout property.

`base` = mode: `"fixed"`, `"fluid"`, or a custom width value.

### Three modes

| Mode | Behavior |
|---|---|
| `"fixed"` (default) | `max-width` steps through breakpoints automatically. |
| `"fluid"` | `width: 100%`. No stepping. Optional `maxWidth` cap. |
| custom (`number \| string`) | Fixed `max-width` at a specific value. |

### Extra fields

| Field | Type | Default | Description |
|---|---|---|---|
| `inset` | string | `"base"` | Spacing variant for horizontal padding (left + right). References `--layout-spacing--*`. |
| `gutter` | string | — | Gutter variant for gap between children. References `--layout-gutters--*`. |
| `direction` | `"row" \| "column"` | — | Sets `display: flex; flex-direction`. |
| `align` | string | — | `align-items` |
| `justify` | string | — | `justify-content` |
| `maxWidth` | breakpoint name or custom value | — | For fixed: caps breakpoint stepping. For fluid: hard `max-width` cap. |

### Variants

```ts
container: {
  base: "fixed",
  inset: "base",
  variants: {
    narrow: { base: "fixed", maxWidth: "md" },
    wide: { base: "fluid", maxWidth: 1600, inset: "relaxed" },
    full: { base: "fluid" },
  },
}
```

Each variant inherits extras from the base when not overridden.

### Responsive

For fixed containers: `responsive` overrides direction, align, justify, inset, gutter — NOT width/maxWidth (auto-generated from breakpoints).

For fluid/custom containers: all properties responsive.

```ts
responsive: [
  { breakpoint: "md", direction: "row", align: "center" },
  { breakpoint: "lg", target: "wide", direction: "row" },
]
```

### Generated classes

- `.prefix-container` — base (always generated, even if not defined)
- `.prefix-container-narrow`, `.prefix-container-wide`, etc. — per variant

### Default container

If `container` is not defined at all, a default fixed container is auto-generated with `inset: "base"`.

---

## Columns

Column grid system with span and offset utility classes.

```ts
// Primitive — just column count
columns: 12

// Extended — override gutter and inset
columns: { size: 12, gutter: "compact", inset: "relaxed" }
```

- `gutter` and `inset` reference spacing/gutter variants via `var(--)`.
- Generates per-breakpoint classes: `.prefix-col-{bp}-{span}`, `.prefix-offset-{bp}-{span}`.

### CSS variables

```css
--prefix-layout-columns--size: 12;
--prefix-layout-columns--gutter: var(--prefix-layout-gutters--base);
--prefix-layout-columns--inset: var(--prefix-layout-spacing--none);
```

---

## Grids

Named CSS Grid presets producing utility classes.

```ts
grids: {
  cards: { templateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "relaxed" },
  feature: {
    templateColumns: "repeat(3, 1fr)", gap: "base",
    responsive: [{ breakpoint: "md", templateColumns: "repeat(2, 1fr)" }],
  },
}
```

### Available fields

`templateColumns`, `templateRows`, `autoRows`, `autoColumns`, `justifyItems`, `alignItems`, `justifyContent`, `alignContent`, `gap` (spacing variant ref), `responsive`.

`gap` references spacing variants: `gap: "relaxed"` → `gap: var(--prefix-layout-spacing--relaxed)`.

### Generated classes

`.prefix-grid-cards`, `.prefix-grid-feature`, etc.

---

## Stacks

Named flexbox presets producing utility classes.

```ts
stacks: {
  vertical: { direction: "column", gap: "relaxed", align: "stretch" },
  horizontal: { direction: "row", gap: "compact", responsive: [{ breakpoint: "sm", direction: "column" }] },
  pills: { direction: "row", inline: true, gap: "compact", wrap: "wrap" },
}
```

### Available fields

`direction` (`"row" | "column"`), `align`, `justify`, `wrap`, `inline` (boolean — `inline-flex`), `gap` (spacing variant ref), `responsive`.

### Generated classes

`.prefix-stack-vertical`, `.prefix-stack-horizontal`, `.prefix-stack-pills`, etc.

---

## Recipes

Free-form layout recipes — same pattern as colors and typography. Recipe props reference spacing variants.

```ts
recipes: {
  section: {
    hero: { paddingY: "relaxed", paddingX: "relaxed" },
    block: { paddingY: "compact", paddingX: "relaxed" },
  },
}
```

### Recipe props

| Prop | CSS output |
|---|---|
| `paddingY` | `padding-top` + `padding-bottom` → `var(--prefix-layout-spacing--variant)` |
| `paddingX` | `padding-left` + `padding-right` |
| `marginY` | `margin-top` + `margin-bottom` |
| `marginX` | `margin-left` + `margin-right` |
| `gap` | `gap` |
| `background` | `background` (literal value, not a spacing ref) |

### Generated classes

`.prefix-section-hero`, `.prefix-section-block`, etc.

---

## Output shape

`theme.layout` follows raw passthrough + computed getters:

```ts
theme.layout.spacing        // raw passthrough
theme.layout.gutters         // raw passthrough
theme.layout.aspectRatio     // raw passthrough
theme.layout.container       // raw passthrough
theme.layout.columns         // raw passthrough
theme.layout.grids           // raw passthrough
theme.layout.stacks          // raw passthrough
theme.layout.recipes         // raw passthrough

theme.layout.tokens          // computed: { spacing: { base, variants }, gutters: {...}, aspectRatio: {...} }
theme.layout.variables       // computed: CssVariablesNode[] (property vars + container/column vars)
theme.layout.nodes           // computed: CssNode[] (all IR: variables + all utility classes + recipes)
theme.layout.classes         // computed: recipe class map
theme.layout.getClass(g, v)  // computed: fn → className | undefined
```

---

## CSS variable naming

With `prefix: "brand"`:

| Source | CSS Variable |
|---|---|
| spacing base | `--brand-layout-spacing--base` |
| spacing relaxed | `--brand-layout-spacing--relaxed` |
| gutters compact | `--brand-layout-gutters--compact` |
| aspectRatio video | `--brand-layout-aspect-ratio--video` |
| container inset | `--brand-layout-container--inset` → `var(--brand-layout-spacing--base)` |
| container wide inset | `--brand-layout-container--wide--inset` → `var(--brand-layout-spacing--relaxed)` |
| columns gutter | `--brand-layout-columns--gutter` → `var(--brand-layout-gutters--base)` |

Container and column variables **reference** spacing/gutter variables via `var(--)`. Responsive spacing changes cascade automatically.

---

## Options

Passed as `options.layout` to `createTheme`:

| Option | Type | Default | Description |
|---|---|---|---|
| `prefix` | `string` | `"dt"` | CSS variable prefix. |
| `classPrefix` | `string` | same as prefix | Utility class prefix. |

---

## Helper hooks

The layout helper (`createLayoutThemeHelper`) declares:

| Hook | What it does |
|---|---|
| `normalizeProperty` | Forces `none: 0` on spacing/gutters. |
| `tokenizeProperty` | Builds variant maps from normalized properties. |
| `mapCssVariables` | Custom naming: `--prefix-layout-{property}--{variant}`. Formats spacing/gutter values as px. |
| `interpretRecipe` | Resolves recipe props (paddingY, gap, etc.) to `var(--)` refs. |
| `buildSlice` | (Currently empty — no extra domain utilities.) |
