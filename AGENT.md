# @theme-registry/theme-kit — Architecture Guide

Design-token engine and recipe system for building framework-agnostic UI kits. This guide covers the internal architecture for both **consumers** of the package and **developers extending** it with new subsystems.

## Key documents

- [`docs/core/README.md`](docs/core/README.md) — complete core reference: pipelines, stages, IR types, media utility, SubsystemHelper contract, output shape.
- [`docs/colors/README.md`](docs/colors/README.md) — colors subsystem reference: input shapes, steps, recipes, CSS variable naming, helper hooks.
- [`docs/typography/README.md`](docs/typography/README.md) — typography subsystem reference: 9 PropertyValue properties, fontSize scale generation, recipes, helper hooks.
- [`docs/layout/README.md`](docs/layout/README.md) — layout subsystem reference: spacing, gutters, aspectRatio, container (3 modes), columns, grids, stacks, recipes.
- [`docs/effects/README.md`](docs/effects/README.md) — effects subsystem reference: radius, shadow, blur, zIndex, opacity, outline, borderWidth, transitions, recipes.
- [`docs/components/README.md`](docs/components/README.md) — components (composition) subsystem reference: cross-subsystem recipe references, delta classes, resolved class names.
- [`docs/adapters/styled-components/README.md`](docs/adapters/styled-components/README.md) — SC adapter reference: media templates, typographyMixin, ThemeAugmentation, three integration patterns.
- [`docs/dtcg/README.md`](docs/dtcg/README.md) — DTCG import/export: fromDTCG, toDTCG, Figma workflow, reference resolution, limitations.
- [`README.md`](README.md) — quick start and public API overview.
- [`examples/colors-app`](examples/colors-app/) — vanilla TS colors example.
- [`examples/typography-app`](examples/typography-app/) — vanilla TS typography example.
- [`examples/layout-app`](examples/layout-app/) — vanilla TS layout example.
- [`examples/effects-app`](examples/effects-app/) — vanilla TS effects example.
- [`examples/components-app`](examples/components-app/) — vanilla TS components (composition) example.
- [`examples/react-app`](examples/react-app/) — React example (bare, no styled-components).
- [`examples/react-sc-app`](examples/react-sc-app/) — React + styled-components example.
- [`examples/angular-app`](examples/angular-app/) — Angular 19 example (InjectionToken, class bindings, CSS vars).
- [`examples/delivery-global-app`](examples/delivery-global-app/) — delivery: single global CSS.
- [`examples/delivery-split-app`](examples/delivery-split-app/) — delivery: variables global, recipes per route.
- [`examples/delivery-component-app`](examples/delivery-component-app/) — delivery: per-component mount/unmount.
- [`examples/delivery-scoped-app`](examples/delivery-scoped-app/) — delivery: scoped MFE variables.
- [`examples/delivery-inline-app`](examples/delivery-inline-app/) — delivery: inline values, no variables.

## Source structure

```
src/
  core/                    framework-neutral pipeline + orchestrator
    common/                shared stage utilities (normalize, tokenize, CSS vars,
                           responsive expansion, IR types, renderer, recipes,
                           recipe resolver, cache, getters)
    media/                 plain MediaDescriptor (breakpoint → query string)
    theme/                 createTheme, ThemeAdapter interface, default CSS adapter
  subsystems/              domain subsystems (plug into the core pipeline)
    colors/                reference implementation (fully ported to new contract)
    typography/            fully ported to new contract
    layout/                fully ported to new contract
    effects/               fully ported to new contract
    components/            composition subsystem (cross-subsystem recipe references)
  adapters/                framework-specific wrappers (opt-in via adapter option)
    styled-components/     SC adapter, media templates, typography mixin
  dtcg/                    W3C DTCG import/export (fromDTCG, toDTCG)
```

**Dependency rule:** subsystems import from core; adapters import from either; nothing imports upward. `core/common` and `core/media` have zero framework imports.

## Architecture overview

### Two pipelines

Every subsystem drives its data through the same two-pipeline model:

**Property pipeline** (per property entry):
```
raw value → normalizePropertyValue → [normalizeProperty hook]
          → generateTokens         → [tokenizeProperty hook]
          → generateCssVariables    → [mapCssVariables hook]
          → expandResponsiveCssVariables → [transformResponsiveCss hook]
```
Output: `CssVariablesNode[]` (IR).

**Recipe pipeline** (per recipe group):
```
raw recipes → normalizeRecipeGroup → [normalizeRecipe hook]
            → createRecipeVariantResolver + interpretRecipe hook (per variant)
            → generateRecipeCss (→ CssRuleNode[])
            → assignRecipeClasses
```
Output: `CssRuleNode[]` + class name map.

### IR (intermediate representation)

Core stages produce `CssNode[]` — typed JS objects, not strings. Two node kinds:
- `CssVariablesNode` — `{ kind: "variables", selector, media?, variables }`.
- `CssRuleNode` — `{ kind: "rule", selector, media?, declarations }`.

Declarations carry optional `ref` and `resolved` fields for delivery flexibility:
- `ref` — the CSS variable name (e.g. `--dt-color--primary`)
- `resolved` — the actual value (e.g. `#4dabf7`)
- `value` — the rendered string (e.g. `var(--dt-color--primary)`) — always present, backward compatible

`renderToCssString(nodes)` converts IR to a CSS string, merging adjacent variable nodes with the same selector+media into one block (single `:root`).

### Output shape

Each subsystem's theme slice is the **raw input enhanced with computed getters**:

```
theme[key] = {
  <raw properties>         passthrough from rawTheme[key]
  recipes: { ... }         raw recipe groups (passthrough)
  get tokens()             computed from property pipeline
  get variables()          CssVariablesNode[] (property variables only)
  get nodes()              CssNode[] (all: variables + recipe rules)
  get classes()            recipe class map
  get styles()             recipe interpreted styles
  get getClass()           fn(group, variant) → className
  get renderRecipe()       fn(group, variant, options?) → CSS string for one recipe
  get <extras>()           subsystem-specific (e.g., lighten, darken for colors)
}
```

Top level:
```
theme.css                  rendered CSS string (all subsystems, single :root)
theme.variablesCss         only :root variable blocks
theme.recipesCss           only recipe rule blocks
theme.nodes                CssNode[] (all subsystems)
theme.media                media descriptor (breakpoint helpers)
```

### Delivery options

`renderRecipe(group, variant, options?)` on each subsystem slice renders CSS for a single recipe variant with delivery options:

| Option | Effect |
|---|---|
| *(default)* | `var(--)` references + only the variables this recipe needs |
| `inline: true` | Resolved values inlined directly, no variables block |
| `scope: "name"` | Variables renamed with prefix (`--name-*`), rules reference scoped vars |
| `includeVariables: false` | Rules only, no variable block (when variables delivered separately) |

Components `renderRecipe` pulls rules from all referenced subsystems + delta class.


### SubsystemHelper contract

Each subsystem exports a `createXThemeHelper()` that returns a helper object. The helper declares hooks the core pipeline invokes:

| Hook | Pipeline | Required | Purpose |
|---|---|---|---|
| `normalizeProperty` | property | no | post-process normalized property (inject defaults, validate extras) |
| `tokenizeProperty` | property | no | extend/replace the base token |
| `mapCssVariables` | property | no | replace the default CSS variable mapper (custom naming) |
| `transformResponsiveCss` | property | no | post-process responsive variable IR nodes |
| `normalizeRecipe` | recipe | no | post-process normalized recipe group |
| `interpretRecipe` | recipe | yes* | per-variant interpreter (domain props → flat CSS declarations) |
| `mapRecipeCss` | recipe | no | post-process recipe CSS output |
| `buildSlice` | slice | no | return subsystem-specific utilities (e.g., lighten/darken) |
| `buildGlobals` | slice | no | attach utilities to theme root (escape hatch) |
| `dependsOn` | ordering | no | declare subsystem dependencies (for composition) |

*Required when the subsystem has recipes.

### Media utility

`core/media/` provides framework-neutral breakpoint logic:

```ts
const media = buildMediaDescriptor(breakpoints, queryResolver);
media.md.min             // "@media (min-width: 768px)"
media.md.max             // "@media (max-width: 1023.98px)" (next - 0.02)
media.md.exact           // min + max combined
media.min("md")          // same as media.md.min
media.exact("md", { orientation: "landscape" })
                         // "@media (min-width: 768px) and (max-width: ...) and (orientation: landscape)"
media.between("sm","lg") // half-open upper bound
```

Callables (`min`, `max`, `exact`, `between`) accept an optional `options` parameter with `orientation?: "landscape" | "portrait"` to compose orientation into the query.

By default, `createTheme` returns this plain `MediaDescriptor` on `theme.media`. The SC adapter (`createStyledComponentsAdapter()`) wraps it with tagged-template functions so `theme.media.md.min\`...\`` works in styled-components.

### Adapter system

`createTheme` accepts an optional `adapter` option controlling output rendering. The adapter interface:

| Hook | Default | Description |
|---|---|---|
| `renderCss(nodes)` | `renderToCssString` | Converts IR to output string |
| `resolveVariableReference(varName)` | `` `var(${varName})` `` | Wraps variable names for declarations |
| `wrapMedia(descriptor)` | passthrough | Transforms MediaDescriptor |
| `renderRecipe?(rules, vars, opts)` | `renderRecipeNodes` | Per-recipe rendering with delivery options |
| `extend?(theme)` | none | Attaches extra utilities to theme root |

The default CSS adapter accepts options: `createCssAdapter({ inline: true })` for inlined values, `createCssAdapter({ scope: "mfe" })` for MFE-namespaced variables. Same raw theme, different output:

```ts
createTheme(rawTheme)                                              // var(--) + global :root
createTheme(rawTheme, { adapter: createCssAdapter({ inline: true }) })    // values inlined
createTheme(rawTheme, { adapter: createCssAdapter({ scope: "widget" }) }) // --widget-* vars
createTheme(rawTheme, { adapter: createStyledComponentsAdapter() })       // SC tagged templates
```

### Responsive model

Properties and recipes support `responsive: [{ breakpoint, query?, variant?, target?, orientation?, ...overrides }]`.

Fields:
- **`variant: "name"`** — at this breakpoint, swap the base flow to the named variant. The base CSS variable is reassigned to `var(--<variant>)`.
- **`target: "name"`** — this responsive rule applies within the named variant's flow only. The override lands on the variant's CSS variables.
- **`orientation: "landscape" | "portrait"`** — appends `(orientation: ...)` to the media query. Combinable with any `query` type.

Both `variant` and `target` are validated during normalization. Responsive overrides are resolved by the core's `expandResponsiveCssVariables` stage using four merge rules: plain override, variant swap, target override, variant swap + inline overrides.

### Colors subsystem (reference implementation)

The colors subsystem (`src/subsystems/colors/`) is the reference for the full pattern. Key features:

- **Input forms:** primitive (`surface: "#f8f9fa"`) or extended (`{ base, text?, variants?, steps?, responsive? }`).
- **Steps:** auto-generate color variants by progressive lightening/darkening. Default steps: `light`, `lighter`, `dark`, `darker`. Numeric steps (e.g., `[50, 100, ..., 900]`) with `baseStep` (defaults to `500`). Each step compounds from the previous, not from the base.
- **`lightenBy` / `darkenBy`:** percentage (0–100) applied per step. Default: `20`.
- **`algorithm: (prev, step, base) => string`:** custom step generator. `prev` = previous step's calculated color, `step` = step name, `base` = the original base color. When provided, replaces the default lighten/darken logic.
- **User-defined variant anchors:** if a `variants` entry matches a step name, that value is used and the progression continues from it.
- **Recipes:** reference palette tokens via dot-notation (`"primary"`, `"primary.text"`, `"primary.dark"`) — emitted as `var(--...)` in the generated CSS. Literal values pass through unchanged.
- **Output:** `theme.colors.primary` (raw passthrough), `theme.colors.tokens`, `.variables`, `.nodes`, `.classes`, `.getClass()`, `.lighten()`, `.darken()` — all at one level.

See [`docs/colors/README.md`](docs/colors/README.md) for the complete reference.

### Typography subsystem

The typography subsystem (`src/subsystems/typography/`) follows the same PropertyValue pattern as colors. Nine properties, each with base + variants:

- **Properties:** `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontStyle`, `textTransform`, `textDecoration`, `textAlign`.
- **fontSize scale:** `ratio` is optional. Without it, fontSize works like any other property (just base + explicit variants). When set (e.g., `"major-third"`), auto-generates scale variants (xs→4xl) during normalization. Custom `algorithm: (base, key, step, prev) => number` can override.
- **Unit handling:** `options.typography.unit` controls fontSize output — `"px"` (default) or `"rem"` (divided by baseFontSize).
- **Recipes:** reference property variants by name: `{ fontFamily: "heading", fontSize: "xl" }` → `font-family: var(--prefix-font-family--heading); font-size: var(--prefix-font-size--xl)`.
- **All hooks:** `normalizeProperty` (scale generation), `tokenizeProperty`, `mapCssVariables` (with unit), `interpretRecipe`, `buildSlice` (returns `style()` utility).
- **Output:** `theme.typography.fontFamily` (raw passthrough), `.tokens`, `.variables`, `.nodes`, `.classes`, `.getClass()`, `.style()` — all at one level.

See [`docs/typography/README.md`](docs/typography/README.md) for the complete reference.

### Layout subsystem

The layout subsystem (`src/subsystems/layout/`) handles spatial structure — spacing, containers, columns, grids, stacks. It has 8 reserved keys:

- **Properties:** `spacing` (PropertyValue<number>), `gutters` (PropertyValue<number>), `aspectRatio` (PropertyValue<string>). `none: 0` always forced on spacing/gutters.
- **Container:** `PropertyValue<string, ContainerExtras>` — 3 modes: `"fixed"` (breakpoint stepping), `"fluid"` (100% width), or custom value. Extras: `inset` (spacing ref), `gutter` (gutter ref), `direction`, `align`, `justify`, `maxWidth`. Supports variants (narrow, wide, full). Fixed containers auto-generate `@media` max-width stepping; responsive entries control direction/align/justify/inset/gutter but NOT width. Default container always generated.
- **Columns:** `size: number` + optional `gutter`/`inset` refs → CSS variables (`var(--prefix-layout-gutters--variant)`) + per-breakpoint span/offset utility classes.
- **Grids:** named CSS Grid presets → utility classes. Props: `templateColumns`, `templateRows`, `gap` (spacing ref), `responsive`.
- **Stacks:** named flexbox presets → utility classes. Props: `direction`, `align`, `justify`, `wrap`, `inline`, `gap` (spacing ref), `responsive`.
- **Recipes:** free-form layout recipes → utility classes. Props: `paddingY`, `paddingX`, `marginY`, `marginX`, `gap`, `background`. Spacing props resolve to `var(--)`.
- **Gap references** in grids, stacks, and containers resolve to `var(--prefix-layout-spacing--variant)` so responsive spacing changes cascade automatically.
- **Output:** `theme.layout.spacing` (raw), `.tokens`, `.variables`, `.nodes`, `.classes`, `.getClass()` — same pattern as colors/typography.

See [`docs/layout/README.md`](docs/layout/README.md) for the complete reference.

### Effects subsystem

The effects subsystem (`src/subsystems/effects/`) handles visual effects — all standard PropertyValue properties:

- **Properties:** `radius` (border-radius), `shadow` (box-shadow), `blur` (filter blur), `zIndex`, `opacity`, `outline` (focus ring), `borderWidth`, `transitions`.
- **Recipes:** compose effects: `{ borderRadius: "lg", boxShadow: "lg" }` → `border-radius: var(--prefix-effects-radius--lg); box-shadow: var(--prefix-effects-shadow--lg)`. `blur` wraps in `blur()` filter function.
- **Hooks:** `tokenizeProperty`, `mapCssVariables` (formats radius/borderWidth/blur as px), `interpretRecipe`.
- **Output:** `theme.effects.radius` (raw), `.tokens`, `.variables`, `.nodes`, `.classes`, `.getClass()`.

See [`docs/effects/README.md`](docs/effects/README.md) for the complete reference.

### Components (composition) subsystem

The components subsystem (`src/subsystems/components/`) composes recipes from multiple primary subsystems into unified component class names:

- **Input:** `rawTheme.components.recipes` — recipe groups where each variant references other subsystems' recipes plus optional CSS overrides.
- **Recipe props:** `colors`, `typography`, `layout`, `effects` (each `"group.variant"` dot-notation reference), `css` (raw CSS overrides as delta).
- **Resolution:** referenced `"group.variant"` strings are looked up in the corresponding subsystem's generated classes. The found class names are collected alongside a delta class for CSS overrides.
- **Output shape:** `theme.components.classes` returns `{ group: { variant: ResolvedComponentClass } }` where `ResolvedComponentClass = { classes: string[], className: string }`.
- **getClass():** returns the combined `className` string: `"dt-color-solid-primary dt-type-heading-large dt-comp-buttons-primary"`.
- **CSS output:** only delta classes are generated. Referenced subsystem classes are reused from their own CSS output.
- **Hooks:** `interpretRecipe` (extracts `css:` overrides), `dependsOn: ["colors", "typography", "layout", "effects"]`.

See [`docs/components/README.md`](docs/components/README.md) for the complete reference.

## For consumers

1. Define your raw theme: `{ breakpoints, colors: { ... }, typography: { ... }, layout: { ... }, effects: { ... }, components: { recipes: { ... } } }`.
2. Call `createTheme(rawTheme, options)`. Options control CSS variable prefixes, units, class prefixes per subsystem.
3. Inject `theme.css` as a global stylesheet (one `<style>` tag, or a `.css` file, or however your framework works).
4. Reference recipe class names via `theme.colors.getClass("group", "variant")` or `theme.typography.getClass("group", "variant")`.
5. Access raw properties at their original path: `theme.colors.primary.base`, `theme.typography.fontFamily.base`.
6. Access computed data via getters: `theme.colors.tokens`, `theme.typography.tokens`, `.variables`, `.nodes`.

## For subsystem developers

1. Create a folder under `src/subsystems/<name>/` with the standard file contract: `index.ts`, `types.ts`, `utils.ts`, `theme.ts`, `tokens.ts`, `recipes.ts` (plus optional `normalize.ts`, `variables.ts`, `constants.ts`).
2. Define your raw source types using `PropertyValue<TValue, TExtra>` from `core/common/types.ts`.
3. Implement a `create<Name>ThemeHelper()` in `theme.ts` that returns the hooks your subsystem needs.
4. At minimum: `key` (the subsystem's raw-theme key), plus `interpretRecipe` if you have recipes.
5. The core pipeline handles normalization, tokenization, CSS variable generation, responsive expansion, recipe CSS serialization, and class assignment. Your hooks post-process at each stage.
6. Keep framework-specific code (SC templates, Angular DI, etc.) in `src/adapters/`, never in the subsystem.
7. Refer to `src/subsystems/colors/` as the reference implementation — it exercises every hook and the full output shape.
