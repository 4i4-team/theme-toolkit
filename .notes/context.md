# @4i4/theme-toolkit — working notes

Styled-components-focused design-token toolkit (colors, typography, layout, media, effects, …). Every subsystem consumes raw source data, normalizes it, and generates tokens + CSS variables through a shared pipeline. Raw sources stay in the theme so child overrides re-flow into helpers; theme-bound utilities are exposed as getters so nested overrides automatically pick up the current state.

## Reference material

- [architecture.md](reference/architecture.md) — canonical architecture spec (the document formerly known as v6)
- [raw-theme-example.js](reference/raw-theme-example.js) — **source of truth** for theme config shape; when prose docs disagree with this, the example wins
- [subsystem-pipeline.md](reference/subsystem-pipeline.md) — worked example of a single subsystem plugged into `createTheme`
- [architecture-notes.md](reference/architecture-notes.md) — design rationale + staging ideas behind the spec
- [archive/architecture-drafts/](reference/archive/architecture-drafts) — superseded v1–v5 drafts kept for history

## Contracts to preserve

- Raw theme example wins over prose docs when they disagree.
- `variant:` (swap base flow to named variant at breakpoint) and `target:` (scope a responsive rule to the named variant's flow) are **distinct** fields; keep both.
- Responsive `breakpoint` values must reference keys from `theme.breakpoints`.
- Theme-bound utilities are exposed as getters with `WeakMap` caches keyed on the smallest relevant dependency object.
- Shared infra handles mechanics (normalize → tokens → CSS vars → recipes); subsystems decide domain interpretation via reducer hooks (`normalizeProperty`, `tokenizeProperty`, `mapCssVariables`, `buildHelpers`, `buildRecipes`).

## 1. Shared utilities rollout

- [x] `normalizePropertyValue` / `normalizeResponsiveOverrides`
- [x] `createDependencyCache`
- [x] `buildMediaHelpers`
- [x] `generateTokens`
- [x] `generateCssVariables`
- [x] `renderAllCssVariables`
- [x] `normalizeRecipeGroup`
- [x] `generateRecipeCss`
- [x] `assignRecipeClasses`
- [x] `defineCachedGetter`
- [x] CSS prefix helpers (normalize + sanitize)

## 2. Colors subsystem retrofit (pilot)

First subsystem ported to the new architecture; reference implementation for the helper contract.

- [x] Refactor palette sources to use shared `PropertyValue` / variants
- [x] Normalize palette tokens via `normalizePropertyValue` + `generateTokens`
- [x] Generate palette CSS via `generateCssVariables` + `renderAllCssVariables`
- [x] Update colors docs with the new raw theme shape
- [x] Adjust `createTheme` integration to consume the new palette helpers

## 3. Core architecture — decisions locked

These are the design calls made during the architecture clarification pass. Implementation work in section 4 builds against this spec.

**Raw theme shape (encapsulation):**
- One key per subsystem: `rawTheme[key]` carries properties and a nested `recipes` object.
- Recipes live at `rawTheme[key].recipes`; the core iterates `rawTheme[key]` as properties and excludes a reserved-keys set (default `["recipes"]`) that the subsystem can declare.
- Runtime mirrors the shape: `theme[key] = { tokens, css, recipes: { css, classes, ... }, ...subsystem utilities }`.

**Subsystem helper contract:**
- Optional hooks at each pipeline stage: `normalizeProperty`, `tokenizeProperty`, `mapCssVariables`, `normalizeRecipe`, `interpretRecipe` (required if the subsystem has recipes), `mapRecipeCss`.
- Required: `buildSlice` to produce the public `theme[key]` surface.
- Optional: `buildGlobals` to lift a utility to the theme root (collisions throw; default is to keep everything under `theme[key]`).
- Optional: `dependsOn?: string[]` for composition subsystems — core topologically sorts subsystems at theme construction; cycles throw.

**Property pipeline (per subsystem, per entry):**
1. Shared `normalizePropertyValue` (validates breakpoint/variant/target refs).
2. Optional `normalizeProperty` hook.
3. Shared `generateTokens`.
4. Optional `tokenizeProperty` hook.
5. Shared `generateCssVariables` — or subsystem's `mapCssVariables` to fully replace the default mapping.
6. **New shared stage `expandResponsiveCssVariables`** — walks each property's `responsive[]` and emits `@media { :root { ... } }` blocks applying the merge rules below.
7. Shared `renderAllCssVariables` assembles the final CSS.

Merge rules the core applies in stage 6:
- Plain responsive entry → override `--<base>` with the new value(s) at the breakpoint.
- `variant: X` → `--<base>` is reassigned to `var(--<variant-X>)` at the breakpoint.
- `target: X, ...overrides` → override `--<variant-X>` with the partial overrides at the breakpoint.
- `variant: X` + inline overrides → swap first, then layer overrides on top of the variant's vars.

**Recipe pipeline (per subsystem):**
1. Shared `normalizeRecipeGroup`.
2. Optional `normalizeRecipe` hook.
3. Subsystem `interpretRecipe(variantName, variant, ctx) → InterpretedVariant` — required when the subsystem has recipes. Context includes `tokens`, `breakpoints`, `media`, `resolveCssVariable(name, variant?) → varName`, and `resolveRecipeVariant(name)` for intra-group lazy memoized sibling resolution (cycle-safe, throws on cycles).
4. Shared `generateRecipeCss` — pure string serialization over the interpreted flat-CSS shape.
5. Shared `assignRecipeClasses` — deterministic class naming.

**Property-reference semantics in recipes:**
- When a recipe prop value names a property (`color: "primary.text"`, `fontSize: "scale.16"`), the interpreter emits `"var(--…)"` into the flat style block — not the resolved literal value.
- Literal values (`padding: "12px 20px"`) pass through unchanged.
- Reference-syntax convention is per-subsystem (colors uses dot-notation with a heuristic; other subsystems can introduce an explicit marker like `"$…"` or `{ ref: "…" }` if literals could collide with references).

**Composition subsystem (Option C — hybrid output):**
- Owns no properties; only recipes that reference other subsystems' recipes via `getSubsystemRecipe(key, group, variant)` in the interpret context.
- Emits a referenced-class list plus a composition-own delta class for its overrides and any responsive reference-swaps that media-query pure class substitution can't express.
- Runtime: `{ classes: [...referenced, own], className: "...", ... }`.

## 4. `createTheme` refactor

Execute section 3 against the existing code.

- [x] Extend the subsystem helper contract in `src/core/theme/helpers.ts` with the new hooks (`normalizeRecipe`, `interpretRecipe`, `mapRecipeCss`, `buildSlice`, `buildGlobals`, `dependsOn`, `transformResponsiveCss?`). Landed in `3cc90e1` as additive optional fields alongside the legacy `buildHelpers` / `buildRecipes`; the createTheme refactor will consume the new hooks and retire the legacy pair.
- [x] Implement the shared core stage `expandResponsiveCssVariables` in `src/core/common/` (merge rules + per-breakpoint output). Landed in `5666db1`; IR migration in `5800b96` (now returns `CssVariablesNode[]`).
- [x] Implement cycle-safe recipe interpretation loop in the core (lazy memoized `resolveRecipeVariant`). Landed in `303843f` as `createRecipeVariantResolver`; not yet wired into `createTheme`.
- [x] CSS IR + `renderToCssString` landed in `79b2902`. `generateRecipeCss` migrated to IR + colors subsystem + `createTheme` reshape landed in `69a938f`. Result: `theme.colors.variables` / `theme.colors.recipes.nodes` (IR), top-level `theme.css` / `theme.nodes` aggregation, single `:root` block across subsystems.
- [x] Wire `expandResponsiveCssVariables` into colors' variables output so responsive palette entries produce `@media { :root { ... } }` overrides in `theme.css`. Landed in `199347d`. `createPaletteCssVariableResolver` matches the palette naming pattern; createTheme concatenates base `:root` + responsive nodes; cache invalidates on palette / breakpoints / media-config changes.
- [x] Fix colors' recipe interpreter to emit `var(--…)` instead of inlined values for property references. Landed in `3f48dfa`. Threads the shared `createPaletteCssVariableResolver` through the interpret chain; supports base / variant / text-field refs. Responsive palette overrides now cascade into recipes via CSS variables with zero JS.
- [x] Align colors raw-theme shape with encapsulation model: nested `rawTheme.colors` with `recipes` as a reserved key. Helper key → `"colors"`. Landed in `2f3aa55`. `extractPaletteProperties` strips the reserved `recipes` key; raw input tracked via closure variable with getter/setter for ThemeProvider override support.
- [x] Refactor createTheme's recipe pipeline to be generic (driven by `createRecipeVariantResolver` + `helper.interpretRecipe` + shared `generateRecipeCss` + `assignRecipeClasses`) — landed in `fe8924d`. Colors is the first subsystem driven by this pattern; same code path will serve typography/layout/effects without any createTheme changes.
- [x] Port colors to refined contract: `interpretRecipe` + `buildSlice` (lighten/darken via `buildSlice`); dropped `buildHelpers` + `buildRecipes`. Landed in same `fe8924d`.
- [ ] Port layout, typography, media, effects onto the standard file contract and helper pattern.
- [ ] Design the composition subsystem (new `components` subsystem? name TBD) and wire `dependsOn` ordering.
- [ ] Adjust shared utility typings to carry the helper context end-to-end.
