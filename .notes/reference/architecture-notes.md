The package has multiple subsystems (layout, typography, media, etc.). Each subsystem owns its own namespace under the styled-components theme object (e.g., `theme.layout`, `theme.typography`). All subsystems consume raw source data defined in the theme, normalize it, and generate design tokens plus CSS variables.

Every base property supports a simple primitive form (`string | number`) as well as an extended object form. Regardless of the input form, normalization produces `{ base: value }`. Extended properties can include subsystem-specific fields but must use the shared special fields `variants` (single level, no nesting, variant values can be primitive or extended, and variants may define `responsive`) and `responsive` (`[{ breakpoint, query?, variant?, ...overrides }]`, with `query` defaulting to `exact`). Responsive entries either reference another variant by name or override fields inline.

All subsystems can define recipes (group + variant) that represent ready-to-use CSS. Recipe variants reuse the responsive contract and should be interpreted by subsystem-specific logic to produce final CSS and class assignments.

Shared utilities required by the architecture:
- Property normalization helper (shared base + responsive + variants handling, subsystem-specific extras layered on top).
- Token generation helper that turns normalized properties into tokens.
- CSS variable generation helper (per subsystem, respecting configurable prefixes).
- Recipe CSS generation helper (shared responsive expansion + CSS serialization; subsystems interpret recipe props).
- CSS class generation/assignment helper (prefix-aware, deterministic names).
- Global CSS variables renderer (collects per-subsystem maps and outputs final CSS).
- Breakpoint/media helper, getter caching helper.

Global `theme.breakpoints` is the single source of truth for responsive logic. Breakpoint values are numbers, and responsive entries must reference existing keys.

`createTheme(rawTheme, options)` receives raw subsystem sources plus global breakpoints and per-subsystem options (units, CSS variable/class prefixes). It returns a runtime theme where every subsystem exposes its utilities as getters, so nested overrides always pick up the current state. Getters may cache based on their dependency slices (using WeakMaps, etc.). Utilities that don’t need theme context should be imported directly instead of being attached.

CSS variable/class prefixes can be customized per subsystem via options. Prefix inputs normalize so variables always start with `--` and class prefixes are sanitized strings (e.g., `dt`).

Responsive `breakpoint` values are strings matching keys from `theme.breakpoints`.

One more change. For the variants instead of having the responsive inside the variant we will use the main responsive property like this { breakpoint: "lg", target: "light", base: 400 }. You can see that we have new property of the responsive "target". We are going to use that to target the variant to which to apply the breakpoint.

I want to define how each subsystem should look like. Each subsystem should stay in own folder. My idea is that because almost all of the subsystems will have there local utilities, like converting HEX to RGB for the color subsystem, those methods to stay in own file. Another file should be used for combining the common (shared) utilities with the local ones exposing the methods to the theme like normalization of the properties or the recipes. If the subsystem is to complex can you any additional files, but for those few we need to use same naming in each subsystem.

Context reminder: we started from an older package, modeled a newer version, built an MVP to discover the true cross-cutting concerns, then extracted shared utilities and retrofitted the color subsystem to the new architecture. Now we're standardizing a common subsystem design (folder structure + role-based files) so every subsystem follows the same pattern while still layering its own domain helpers.

Normalization staging idea: maintain a reducer-like pipeline where shared normalization runs first (primitive → `{ base, variants, responsive }`, breakpoint validation, etc.), then the subsystem receives that normalized object and applies domain-specific post-processing (injecting defaults like `light`/`dark`, enforcing reserved variants such as layout’s `none`, additional validation). Every subsystem should treat shared normalization output as the “state so far” and return an updated state, keeping the shared + local responsibilities clearly separated.

Subsystem helper contract idea: each subsystem exports a `createThemeHelper()` (or similarly named) adapter. The helper returns the functions `createTheme` needs (`buildHelpers`, `buildRecipes`, etc.) plus optional hooks such as `normalizeProperty`. During theme creation, the shared pipeline runs basic normalization first, then calls the subsystem hook if it exists. This centralizes orchestration while keeping subsystem-specific logic optional and localized.

Tokenization staging idea: mirror the same reducer pattern for token generation. `createTheme` runs the shared token generator for each normalized property (or token group) and, if the subsystem exposes a `tokenizeProperty` hook, passes the intermediate token state to that hook so it can augment or lock subsystem-specific data (e.g., auto-generating `light/dark` variants). This keeps the shared token pipeline consistent while letting subsystems post-process their tokens when needed.

CSS variable generation idea: `createTheme` should render CSS variables directly from the tokens using the shared `generateCssVariables` + `renderAllCssVariables` helpers. Subsystems only provide their preferred prefixes (e.g., palette options supplying `brand` → `--brand-color--*` / `--brand-text--*`). `createTheme` ensures prefixes are normalized (prepend `--` if missing) so subsystems only decide naming patterns, not the rendering mechanics.
If needed later, we can mirror the reducer pattern here too by letting subsystems expose an optional `mapCssVariables` hook that receives the generated variable map and returns an augmented version (reserved names, extra aliases, etc.), but the default remains “shared renderer handles everything once tokens are finalized.”

Theme namespace idea: keep subsystem utilities under their own slice (e.g., `theme.palette.tokens`, `theme.palette.css`, `theme.palette.recipes`) instead of attaching multiple getters at the theme root. Shared aggregate getters (`theme.tokens`) can be layered on top if needed, but the canonical access path stays namespaced to the subsystem.
