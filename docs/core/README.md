# Core Reference

Complete reference for the core pipeline, shared utilities, IR types, media utility, and the SubsystemHelper contract. This covers `src/core/common/`, `src/core/media/`, and `src/core/theme/helpers.ts`.

---

## Table of contents

- [Pipeline overview](#pipeline-overview)
- [Property pipeline stages](#property-pipeline-stages)
- [Recipe pipeline stages](#recipe-pipeline-stages)
- [IR types](#ir-types)
- [Rendering](#rendering)
- [Media utility](#media-utility)
- [SubsystemHelper contract](#subsystemhelper-contract)
- [Responsive model](#responsive-model)
- [Output shape convention](#output-shape-convention)
- [CSS prefix helpers](#css-prefix-helpers)
- [Caching utilities](#caching-utilities)
- [Reserved keys](#reserved-keys)

---

## Pipeline overview

Every subsystem processes its data through two pipelines. The core owns the shared stages; subsystems provide optional hooks at each step.

### Property pipeline

Transforms raw property definitions into CSS custom properties.

```
raw property
  -> normalizePropertyValue          shared: primitive → { base }, validate variants/responsive
  -> [helper.normalizeProperty]      hook: inject defaults, enforce subsystem rules
  -> generateTokens                  shared: normalized → token (subsystem provides builder fn)
  -> [helper.tokenizeProperty]       hook: extend/replace each token
  -> generateCssVariables            shared: tokens → Record<varName, value>
     OR [helper.mapCssVariables]     hook: fully replace the variable mapper (custom naming)
  -> expandResponsiveCssVariables    shared: emit @media :root overrides from responsive[]
  -> [helper.transformResponsiveCss] hook: post-process responsive IR nodes
```

Output: `CssVariablesNode[]` — IR nodes ready for `renderToCssString`.

### Recipe pipeline

Transforms raw recipe definitions into CSS rule nodes + class names.

```
raw recipe group
  -> normalizeRecipeGroup              shared: validate breakpoint/variant/target refs
  -> [helper.normalizeRecipe]          hook: post-process normalized group
  -> createRecipeVariantResolver       shared: cycle-safe, memoized variant resolution
     -> helper.interpretRecipe         hook: per-variant, domain props → flat CSS declarations
  -> generateRecipeCss                 shared: interpreted group → CssRuleNode[]
  -> [helper.mapRecipeCss]             hook: post-process recipe CSS
  -> assignRecipeClasses               shared: deterministic class names
```

Output: `CssRuleNode[]` + `Record<group, Record<variant, className>>`.

---

## Property pipeline stages

### `normalizePropertyValue(value, options?)`

**File:** `src/core/common/properties.ts`

Converts a raw property value to canonical `NormalizedPropertyValue` form.

- Primitives wrap into `{ base: value }`.
- Extended objects already have `base`; extras (`variants`, `responsive`, TExtra fields) are preserved.
- Variants are normalized recursively (primitive → `{ base }`).
- Responsive entries pass through `normalizeResponsiveOverrides` (validates breakpoint, variant, target refs).

```ts
normalizePropertyValue<TValue, TExtra, TBreakpoint>(
  value: PropertyValue<TValue, TExtra, TBreakpoint>,
  options?: {
    propertyPath?: string;
    coerceValue?: (v: TValue) => TValue;
    fallbackBase?: TValue;
    allowedBreakpoints?: readonly TBreakpoint[];
  },
) => NormalizedPropertyValue<TValue, TExtra, TBreakpoint>
```

### `generateTokens(values, buildToken)`

**File:** `src/core/common/tokens.ts`

Iterates a `Record<name, normalizedValue>` and applies a builder function to each entry.

```ts
generateTokens<TKey, TValue, TToken>(
  values: Record<TKey, TValue>,
  buildToken: (ctx: { name: TKey; value: TValue }) => TToken,
) => Record<TKey, TToken>
```

The subsystem provides the builder; the core handles iteration.

### `generateCssVariables(tokens, options?)`

**File:** `src/core/common/cssVariables.ts`

Maps tokens to a flat `Record<varName, value>` (CssVariableMap).

```ts
generateCssVariables<TKey, TToken>(
  tokens: Record<TKey, TToken>,
  options?: {
    prefix?: string;
    formatName?: (name: TKey) => string;
    mapToken?: (ctx: { name, token, prefix, formatName }) => CssVariableMap;
  },
) => CssVariableMap
```

- Default mapper produces one variable per token: `${prefix}-${sanitizedName}`.
- `mapToken` replaces the default entirely (colors uses this for nested naming like `--dt-color--primary--dark`).
- `prefix` is normalized via `normalizeCssVariablePrefix` (ensures `--` leading, defaults to `--dt`).

### `expandResponsiveCssVariables(properties, options)`

**File:** `src/core/common/responsiveCssVariables.ts`

Walks each property's `responsive[]` entries and emits per-breakpoint `@media` variable override nodes.

```ts
expandResponsiveCssVariables<TValue, TExtra, TBreakpoint>(
  properties: Record<string, NormalizedPropertyValue<...>>,
  options: {
    resolveCssVariable: ResolveCssVariableName;
    media: MediaDescriptor<TBreakpoint>;
    formatValue?: (value: unknown) => string;
    selector?: string;    // defaults to ":root"
  },
) => CssVariablesNode[]
```

Applies the four merge rules:
1. **Plain override** — update the base variable(s) at the breakpoint.
2. **`variant: X`** — reassign `--<base>` to `var(--<variant-X>)`.
3. **`target: X`** — override variant X's variables only.
4. **`variant: X` + inline overrides** — swap flow, then layer overrides on top.

`resolveCssVariable(name, variant?, field?)` is provided by the subsystem so the naming matches whatever `generateCssVariables` / `mapCssVariables` produced.

---

## Recipe pipeline stages

### `normalizeRecipeGroup(group, options?)`

**File:** `src/core/common/recipes.ts`

Validates and normalizes a recipe group (map of variant name → variant definition). Each variant's `responsive[]` is validated against `allowedBreakpoints` and known variant names.

```ts
normalizeRecipeGroup<TProps, TBreakpoint>(
  group: RecipeGroupDefinition<TProps, TBreakpoint>,
  options?: {
    propertyPath?: string;
    allowedBreakpoints?: readonly TBreakpoint[];
  },
) => NormalizedRecipeGroup<TProps, TBreakpoint>
```

### `createRecipeVariantResolver(group, interpret, options?)`

**File:** `src/core/common/recipeResolver.ts`

Returns a memoized `resolve(variantName)` + `resolveAll()` pair. The subsystem's `interpretRecipe` hook is wrapped with:
- **Lazy evaluation:** each variant is interpreted on first access.
- **Memoization:** subsequent accesses return the cached result.
- **Cycle detection:** if variant A references variant B which references A, throws with a readable path (`"a -> b -> a"`).

```ts
createRecipeVariantResolver<TProps, TBreakpoint, TInterpreted>(
  group: NormalizedRecipeGroup<TProps, TBreakpoint>,
  interpret: (name, variant, resolve) => TInterpreted,
  options?: { groupPath?: string },
) => {
  resolve: (name: string) => TInterpreted;
  resolveAll: () => Record<string, TInterpreted>;
}
```

### `generateRecipeCss(group, options)`

**File:** `src/core/common/recipes/css.ts`

Converts an interpreted recipe group (flat CSS declarations per variant) into `CssRuleNode[]`.

```ts
generateRecipeCss<TBreakpoint>(
  group: InterpretedRecipeGroup<TBreakpoint>,
  options: {
    media: MediaDescriptor<TBreakpoint>;
    selectorBuilder: (variantName: string) => string;
  },
) => {
  nodes: CssRuleNode[];
  variants: Record<string, string>;   // variantName → selector
}
```

Each variant's base declarations become a `CssRuleNode` (no media). Each responsive entry becomes a separate `CssRuleNode` (with `media` from the descriptor). Reserved keys (`breakpoint`, `query`, `variant`, `target`) are stripped from responsive declarations.

### `assignRecipeClasses(variants, options?)`

**File:** `src/core/common/recipes/classes.ts`

Maps variant selectors to deterministic class names.

```ts
assignRecipeClasses(
  variants: Record<string, string>,
  options?: { prefix?: string; hash?: (input: string) => string },
) => Array<{ variant: string; selector: string; className: string }>
```

---

## IR types

**File:** `src/core/common/cssNodes.ts`

```ts
type CssDeclaration = {
  property: string;
  value: string | number;
  ref?: string;             // CSS variable name (e.g. "--dt-color--primary")
  resolved?: string | number; // actual value (e.g. "#4dabf7")
};

type CssVariablesNode = {
  kind: "variables";
  selector: string;               // typically ":root"
  media?: string;                 // present for responsive overrides
  variables: Record<string, string>;
};

type CssRuleNode = {
  kind: "rule";
  selector: string;               // e.g. ".dt-color-solid-primary"
  media?: string;                 // present for responsive recipe entries
  declarations: CssDeclaration[];
};

type CssNode = CssVariablesNode | CssRuleNode;
```

`ref` and `resolved` enable flexible delivery — the same IR can render as `var(--)` references (default), inlined values (`inline: true`), or scoped variables (`scope: "mfe-name"`).

Subsystems produce `CssNode[]`; the renderer converts to strings. Adapters can implement alternative converters (e.g., `renderToStyledComponentsRuleSet`, `renderToCssObject`).

---

## Rendering

### `renderToCssString(nodes, options?)`

**File:** `src/core/common/cssRenderer.ts`

Converts `CssNode[]` to a CSS string. Key behavior: adjacent `CssVariablesNode`s with the same `selector` + `media` are **merged into a single block**, so multiple subsystems contributing `:root` variables produce exactly one `:root { ... }` block.

```ts
renderToCssString(
  nodes: CssNode[],
  options?: { indent?: string; newline?: string },
) => string
```

Nodes with `media` are wrapped: `@media (...) { selector { ... } }`. Nodes without `media` emit: `selector { ... }`.

---

## Delivery

**Files:** `src/core/common/cssRender.ts`, `src/core/common/cssEnrich.ts`

The same IR supports multiple delivery strategies via `renderRecipe` (per-subsystem) and split getters (theme-level).

### Theme-level split

```ts
theme.css              // all variables + all recipe rules (single output)
theme.variablesCss     // only :root variable blocks
theme.recipesCss       // only recipe rule blocks
```

### Per-recipe rendering

Each subsystem slice exposes `renderRecipe(group, variant, options?)`:

```ts
// Default — var references + only the variables this recipe uses
theme.colors.renderRecipe("solid", "primary")
// → :root { --dt-color--primary: #4dabf7; ... }
// → .dt-color-solid-primary { background: var(--dt-color--primary); ... }

// Inline — resolved values, no variables
theme.colors.renderRecipe("solid", "primary", { inline: true })
// → .dt-color-solid-primary { background: #4dabf7; color: #fff; }

// Scoped — MFE-safe namespaced variables
theme.colors.renderRecipe("solid", "primary", { scope: "checkout" })
// → :root { --checkout-color--primary: #4dabf7; ... }
// → .dt-color-solid-primary { background: var(--checkout-color--primary); ... }

// Rules only — variables delivered separately
theme.colors.renderRecipe("solid", "primary", { includeVariables: false })
// → .dt-color-solid-primary { background: var(--dt-color--primary); ... }
```

### Components cross-subsystem

`theme.components.renderRecipe("buttons", "primary")` collects rules from all referenced subsystems (colors, typography, effects, layout) plus the delta class, and renders them with the chosen options.

### Options

| Option | Type | Default | Effect |
|---|---|---|---|
| `inline` | `boolean` | `false` | Use resolved values instead of `var(--)` references |
| `scope` | `string` | — | Prefix variable names for MFE isolation |
| `includeVariables` | `boolean` | `true` | Include the `:root` variable block |

---

## Adapter

**Files:** `src/core/theme/adapter.ts`, `src/core/theme/cssAdapter.ts`

`createTheme` accepts an optional `adapter` that controls how the IR is rendered and how variable references are formatted.

```ts
interface ThemeAdapter<TMediaOutput = unknown> {
  renderCss(nodes: CssNode[]): string;
  resolveVariableReference(variableName: string): string;
  wrapMedia<TBreakpoint>(descriptor: MediaDescriptor<TBreakpoint>): TMediaOutput;
  renderRecipe?(rules: CssRuleNode[], variables: CssVariablesNode[], options?: RenderRecipeOptions): string;
  extend?(theme: Record<string, unknown>): Record<string, unknown>;
}
```

| Hook | Default (CSS adapter) | Description |
|---|---|---|
| `renderCss` | `renderToCssString(nodes)` | Converts IR to output format |
| `resolveVariableReference` | `` (v) => `var(${v})` `` | Wraps variable names for declarations |
| `wrapMedia` | passthrough (plain strings) | Transforms MediaDescriptor for the target |
| `renderRecipe` | `renderRecipeNodes(rules, vars, opts)` | Per-recipe rendering with delivery options |
| `extend` | none | Attaches extra utilities to theme root |

### Adapter options

The default CSS adapter accepts options that apply to all rendering:

```ts
createCssAdapter()                         // default — var(--) references, global variables
createCssAdapter({ inline: true })         // inline — resolved values, no variables
createCssAdapter({ scope: "checkout" })    // scoped — --checkout-* namespaced variables
```

| Option | Effect on `theme.css` | Effect on `renderRecipe` |
|---|---|---|
| *(none)* | Standard CSS with `var(--)` + `:root` | Same, filtered to recipe's dependencies |
| `inline` | No variables, values baked into rules | Same |
| `scope` | Variables renamed `--scope-*`, rules reference scoped vars | Same, per-call can override |

Per-call `renderRecipe` options can override adapter defaults.

### Usage examples

```ts
import { createTheme, createCssAdapter, createStyledComponentsAdapter } from "@theme-registry/theme-kit";

// Default — plain CSS with var(--) references
const appTheme = createTheme(rawTheme);

// Embedded widget — scoped variables, no conflicts with host app
const widgetTheme = createTheme(rawTheme, {
  adapter: createCssAdapter({ scope: "widget" }),
});

// Email template — inlined values, no CSS variables at all
const emailTheme = createTheme(rawTheme, {
  adapter: createCssAdapter({ inline: true }),
});

// styled-components — media as tagged template functions
const scTheme = createTheme(rawTheme, {
  adapter: createStyledComponentsAdapter(),
});

// React Native — inline values as style objects (theoretical, not shipped)
// const rnTheme = createTheme(rawTheme, {
//   adapter: createReactNativeAdapter(),
// });
```

Custom adapters can target other platforms:
- **styled-components:** `createStyledComponentsAdapter()` — wraps media as tagged templates
- **SASS:** render `$variables`, `` resolveVariableReference: (v) => `$${v.replace(/^--/, '')}` ``
- **React Native:** inline resolved values, render to StyleSheet objects

---

## Media utility

**Files:** `src/core/media/descriptors.ts`, `src/core/media/queries.ts`

Framework-neutral breakpoint-to-query-string computation.

### `buildMediaDescriptor(breakpoints, resolveQuery)`

Returns a `MediaDescriptor<TBreakpoint>` — a flattened object with:
- **Per-breakpoint groups:** `descriptor[key].min`, `.max`, `.exact` — pre-built query strings.
- **Callables:** `descriptor.min(key, options?)`, `.max(key, options?)`, `.exact(key, options?)`, `.between(from, to, options?)`. When `options` includes `orientation`, the callable builds a custom query string that appends `(orientation: ...)`.

```ts
type MediaDescriptor<T> = {
  min: (key: T, options?) => string;
  max: (key: T, options?) => string;
  exact: (key: T, options?) => string;
  between: (from: T, to: T, options?) => string;
} & Record<T, { min: string; max: string; exact: string }>;
```

Boundary rules:
- `min` = `(min-width: <breakpoint>px)` — the breakpoint's own value.
- `max` = `(max-width: <next-breakpoint - 0.02>px)` — just below the next. Empty for the last breakpoint.
- `exact` = `min` + `max` combined. Collapses to `min` for the last breakpoint.

Reserved breakpoint names (`min`, `max`, `exact`, `between`) throw at construction.

### Types

```ts
type MediaConfig = { unit?: "px" | "em" | "rem"; baseFontSize?: number };
type MediaQueryOptions = { min?: number; max?: number; orientation?: "landscape" | "portrait" };
```

`resolveMediaConfig(config?)` fills defaults (`px`, `16`). `mediaQueryString(options, config)` formats a single query.

---

## SubsystemHelper contract

**File:** `src/core/theme/helpers.ts`

Each subsystem exports a `create<Name>ThemeHelper()` returning an object that satisfies `SubsystemThemeHelper`.

### Property pipeline hooks

| Hook | Signature | Called |
|---|---|---|
| `normalizeProperty` | `(name, raw, normalized) => normalized` | After shared normalization, per property |
| `tokenizeProperty` | `(name, normalized, baseToken) => token` | After shared token generation, per property |
| `mapCssVariables` | `(tokens, prefix) => Record<varName, value>` | Replaces the default CSS variable mapper entirely |
| `transformResponsiveCss` | `(nodes, { tokens, breakpoints }) => nodes` | After responsive expansion, full node list |

### Recipe pipeline hooks

| Hook | Signature | Called |
|---|---|---|
| `normalizeRecipe` | `(group) => group` | After shared recipe normalization, per group |
| `interpretRecipe` | `(variantName, variant, context) => InterpretedRecipeVariant` | Per variant, via the cycle-safe resolver |
| `mapRecipeCss` | `(css, { classes, selectors }) => css` | After recipe CSS generation |

`RecipeInterpretContext` provides:
- `tokens` — the subsystem's tokens (cast internally).
- `breakpoints` — the theme's breakpoint map.
- `resolveCssVariable(name, variant?, field?)` — produces the CSS variable name matching the subsystem's naming convention.
- `resolveVariableReference(variableName)` — wraps a CSS variable name for use in declarations (adapter-driven; defaults to `var(--name)`).
- `resolveRecipeVariant(variantName)` — lazily resolves a sibling variant (cycle-safe).
- `groupPath` — for contextual error messages.

### Slice builders

| Hook | Signature | Called |
|---|---|---|
| `buildSlice` | `(context: SubsystemSliceContext) => extras` | After pipelines complete; returns subsystem-specific getters (e.g., `lighten`, `darken`) |
| `buildGlobals` | `(context & { slice }) => Record<string, unknown>` | Optional; attaches utilities at the theme root |

`SubsystemSliceContext` contains: `source`, `tokens`, `variableNodes`, `recipes: { nodes, classes }`, `options`.

### Dependency ordering

`dependsOn?: readonly string[]` — composition subsystems declare the primary subsystems they reference. The core topologically sorts subsystems before iterating; cycles throw.

---

## Responsive model

Properties and recipes support `responsive: [{ breakpoint, query?, variant?, target?, orientation?, ...overrides }]`.

### Fields

| Field | Required | Values | Default |
|---|---|---|---|
| `breakpoint` | yes | key from `theme.breakpoints` | — |
| `query` | no | `"min"` \| `"max"` \| `"exact"` | `"exact"` |
| `variant` | no | name of a variant in the property's `variants` map | — |
| `target` | no | name of a variant to scope this rule to | — |
| `orientation` | no | `"landscape"` \| `"portrait"` | — |

### Semantics

- **`variant: "name"`** — at this breakpoint, swap the base flow to the named variant. The base CSS variable is reassigned to `var(--<variant>)`. Inline overrides in the same entry apply on top of the variant's values.
- **`target: "name"`** — this responsive rule applies within the named variant's flow. The override lands on the variant's CSS variables, not the base.
- **`orientation: "landscape" | "portrait"`** — appends `(orientation: ...)` to the media query. Combinable with any `query` type. Example: `{ breakpoint: "md", query: "exact", orientation: "landscape" }` produces `@media (min-width: 768px) and (max-width: 1023.98px) and (orientation: landscape)`.
- `variant` and `target` cannot both be set on the same entry.

### Precedence

```
base value
  → selected variant (if any)
  → responsive override for base flow (no variant/target)
  → responsive variant swap (variant: X)
  → responsive target override (target: X)
```

---

## Output shape convention

Each subsystem's theme slice follows the **raw passthrough + computed getters** pattern:

```ts
theme[key] = {
  // Raw input properties (passthrough from rawTheme[key])
  primary: ...,
  secondary: ...,
  recipes: { ... },          // raw recipe groups

  // Computed getters
  get tokens() {},           // token map
  get variables() {},        // CssVariablesNode[] (property variables only)
  get nodes() {},            // CssNode[] (all: variables + recipe rules)
  get classes() {},          // recipe class name map
  get styles() {},           // recipe interpreted styles
  get getClass() {},         // fn(group, variant) → className | undefined
  get renderRecipe() {},     // fn(group, variant, options?) → CSS string
  get <extras>() {},         // subsystem-specific (lighten, darken, mixin, ...)
};
```

Top level:
```ts
theme.css                    // rendered CSS string (all subsystems, single :root)
theme.variablesCss           // only :root variable blocks
theme.recipesCss             // only recipe rule blocks
theme.nodes                  // CssNode[] (all subsystems)
theme.media                  // media descriptor
theme.breakpoints            // raw breakpoint map
```

No `source` wrapper — raw properties are accessible at their original path.

---

## CSS prefix helpers

**File:** `src/core/common/css.ts`

```ts
sanitizeIdentifierSegment(segment: string) => string
// "My Color!" → "my-color"

normalizeCssVariablePrefix(prefix?: string, fallback?: string) => string
// "dt" → "--dt", "--dt" → "--dt", undefined → "--dt"

normalizeCssClassPrefix(classPrefix?: string, fallback?: string) => string
// "dt" → "dt", "--dt" → "dt", undefined → "dt"
```

---

## Caching utilities

### `createDependencyCache()`

**File:** `src/core/common/cache.ts`

WeakMap-backed memoizer keyed by object identity.

```ts
const cache = createDependencyCache<TKey, TValue>();
cache.get(dep, () => expensiveCompute());  // returns cached if dep identity matches
cache.peek(dep);                            // returns cached or undefined (no compute)
cache.set(dep, value);                      // manual set
cache.clear(dep);                           // invalidate
```

### `defineCachedGetter(target, options)`

**File:** `src/core/common/getters.ts`

Attaches a getter to an object that memoizes by dependency identity.

```ts
defineCachedGetter(target, {
  key: "media",
  getDependency: (t) => t.breakpoints,
  createValue: (dep, t) => buildMedia(dep),
  enumerable: true,
});
```

---

## Reserved keys

These names cannot be used as property keys within a subsystem's raw input because they collide with computed getters:

**On the subsystem slice:** `tokens`, `variables`, `nodes`, `classes`, `styles`, `getClass`, `recipes`, and any extras the subsystem defines (e.g., `lighten`, `darken` for colors).

**On the breakpoint map:** `min`, `max`, `between` (collide with the media descriptor's callables).

The media descriptor throws at construction if a breakpoint name collides. Subsystem-level collision guards should be added per subsystem.
