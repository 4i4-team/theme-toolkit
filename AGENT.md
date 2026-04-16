# Architecture Agent Notes

This toolkit exposes theme subsystems (layout, typography, media, colors, effects, etc.) that all follow the same normalization/token/CSS pipeline. Use this guide both when **consuming** the package and when **extending** it with new subsystems.

## Key documents
- `.notes/reference/architecture.md` – latest architecture spec (keep in sync with code).
- `.notes/reference/raw-theme-example.js` – sample raw theme exercising every feature; treat as the source of truth when prose docs disagree.
- `.notes/reference/subsystem-pipeline.md` – worked example of one subsystem plugged into `createTheme`.
- `.notes/reference/architecture-notes.md` – canonical requirements and design rationale for properties, variants, responsive rules, recipes, breakpoints, and `createTheme` behavior.
- `.notes/context.md` – current backlog and rollout status for shared utilities and subsystem retrofits.
- `docs/common/README.md` – detailed guide to every common helper.

## Using the toolkit (package consumers)
1. Author a raw theme with `{ breakpoints, layout?, typography?, ... }` following the example file.
2. Call `createTheme(rawTheme, options)` (subsystem options control units + CSS prefixes).
3. `ThemeProvider` receives the returned theme object; access subsystem helpers via getters (e.g., `theme.media`, `theme.layoutContainer('lg')`).
4. Use generated CSS variables (`theme.colors.css`, `theme.typography.css`, etc.) to bootstrap global styles.
5. When overriding theme slices in nested providers, keep shapes aligned with the shared `PropertyValue` contract so getters react automatically.

## Extending the toolkit (subsystem developers / agents)
1. Define raw source types in terms of `PropertyValue` / `RecipeVariantDefinition` from `src/common/types.ts`.
2. Normalize those inputs with `normalizePropertyValue` (or future convenience wrappers) and feed the result to your token builder.
3. Expose token → CSS variable generation via the shared helpers (`generateTokens`, `generateCssVariables`, `renderAllCssVariables` once implemented).
4. Recipes should follow the shared contracts: interpret raw recipes → normalized instructions (`interpretRecipe`), serialize via `generateRecipeCss`, and assign classes deterministically (`assignRecipeClasses`).
5. Attach all subsystem utilities to the theme via getters that leverage `createDependencyCache` so nested overrides stay in sync.
6. Respect global breakpoints: responsive entries must reference keys from `theme.breakpoints`; use `target` + `variant` to describe merge order.
7. Keep documentation (`docs/<subsystem>`) aligned with the common contract—link back to `docs/common/README.md` for shared behavior.

Adhering to these guidelines keeps every subsystem interoperable and makes it easier for future contributors (human or automated) to extend the toolkit.
