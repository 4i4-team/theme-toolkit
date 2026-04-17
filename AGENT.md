# @theme-registry/theme-kit — Architecture Guide

Design-token engine and recipe system for building framework-agnostic UI kits. This guide covers the internal architecture for both **consumers** of the package and **developers extending** it with new subsystems.

## Key documents

- [`docs/core/README.md`](docs/core/README.md) — complete core reference: pipelines, stages, IR types, media utility, SubsystemHelper contract, output shape.
- [`docs/colors/README.md`](docs/colors/README.md) — colors subsystem reference: input shapes, steps, recipes, CSS variable naming, helper hooks. Reference implementation of the subsystem pattern.
- [`README.md`](README.md) — quick start and public API overview.
- [`examples/colors-app`](examples/colors-app/) — vanilla TS example: step swatches, recipe buttons, responsive demo, generated CSS viewer.

## Source structure

```
src/
  core/                    framework-neutral pipeline + orchestrator
    common/                shared stage utilities (normalize, tokenize, CSS vars,
                           responsive expansion, IR types, renderer, recipes,
                           recipe resolver, cache, getters)
    media/                 plain MediaDescriptor (breakpoint → query string)
    theme/                 createTheme + SubsystemHelper contract types
  subsystems/              domain subsystems (plug into the core pipeline)
    colors/                reference implementation (fully ported to new contract)
    typography/            legacy — not yet ported
    layout/                legacy — not yet ported
    media/                 SC-wrapped media templates (legacy; Phase-2 → adapters/)
    effects/               types + builder, not yet integrated
  adapters/                framework-specific wrappers
    styled-components/     SC DefaultTheme augmentation
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
  get <extras>()           subsystem-specific (e.g., lighten, darken for colors)
}
```

Top level:
```
theme.css                  rendered CSS string (all subsystems, single :root)
theme.nodes                CssNode[] (all subsystems)
theme.media                media descriptor (breakpoint helpers)
```

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

The SC-wrapped version (`subsystems/media/templates.ts`) turns these strings into tagged-template functions. That wrapping is an adapter concern, not core.

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

## For consumers

1. Define your raw theme: `{ breakpoints, colors: { ..., recipes: { ... } }, typography?: ..., layout?: ... }`.
2. Call `createTheme(rawTheme, options)`. Options control CSS variable prefixes, units, class prefixes per subsystem.
3. Inject `theme.css` as a global stylesheet (one `<style>` tag, or a `.css` file, or however your framework works).
4. Reference recipe class names via `theme.colors.getClass("group", "variant")` or the `theme.colors.classes` map.
5. Access raw properties at their original path: `theme.colors.primary.base`, `theme.colors.primary.text`.
6. Access computed data via getters: `theme.colors.tokens`, `theme.colors.variables`, `theme.colors.nodes`.

## For subsystem developers

1. Create a folder under `src/subsystems/<name>/` with the standard file contract: `index.ts`, `types.ts`, `utils.ts`, `theme.ts`, `tokens.ts`, `recipes.ts` (plus optional `normalize.ts`, `variables.ts`, `constants.ts`).
2. Define your raw source types using `PropertyValue<TValue, TExtra>` from `core/common/types.ts`.
3. Implement a `create<Name>ThemeHelper()` in `theme.ts` that returns the hooks your subsystem needs.
4. At minimum: `key` (the subsystem's raw-theme key), plus `interpretRecipe` if you have recipes.
5. The core pipeline handles normalization, tokenization, CSS variable generation, responsive expansion, recipe CSS serialization, and class assignment. Your hooks post-process at each stage.
6. Keep framework-specific code (SC templates, Angular DI, etc.) in `src/adapters/`, never in the subsystem.
7. Refer to `src/subsystems/colors/` as the reference implementation — it exercises every hook and the full output shape.
