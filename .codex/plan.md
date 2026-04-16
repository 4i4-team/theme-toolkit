# Shared Utilities Rollout

## Completed
1. `normalizePropertyValue` / `normalizeResponsiveOverrides`
2. `createDependencyCache`
3. `buildMediaHelpers`
4. `generateTokens`
5. `generateCssVariables`
6. `renderAllCssVariables`
7. `normalizeRecipeGroup`
8. `generateRecipeCss`
9. `assignRecipeClasses`
10. `defineCachedGetter`
11. CSS prefix helpers (normalize + sanitize)

## Colors subsystem
- [x] Refactor palette sources to use shared `PropertyValue` / variants.
- [x] Normalize palette tokens via shared helpers (`normalizePropertyValue` + `generateTokens`).
- [x] Generate palette CSS via `generateCssVariables` + `renderAllCssVariables`.
- [x] Update colors docs with the new raw theme shape and usage.
- [x] Adjust `createTheme` integration to consume the new palette helpers.

## Subsystem helper refactor
- [ ] Design `createThemeHelper` interface (normalization/token/CSS/recipe hooks + builder functions).
- [ ] Update each subsystem to export a helper instance (`createPaletteThemeHelper`, etc.).
- [ ] Refactor `createTheme` to orchestrate normalization → tokenization → CSS variable rendering → recipes through helper hooks.
- [ ] Adjust shared utility typings to support the helper context (normalized property/token shapes, CSS variable maps).
