# Delivery Styles Example

Vanilla TypeScript — demonstrates all CSS delivery strategies from the same raw theme.

## What to look for

Six tabs showing different delivery approaches, all using the same theme input:

- **`1. Single Global`** — one `<style>` tag with all variables + all recipe rules. Current default. Simplest setup.
- **`2. Split Vars/Rules`** — `theme.variablesCss` and `theme.recipesCss` as separate `<style>` tags. Variables load first, rules can be deferred.
- **`3. Per-Recipe`** — `renderRecipe(group, variant)` extracts CSS for a single recipe with only its required variables. PrimeNG-style component delivery.
- **`4. Inline Values`** — `createCssAdapter({ inline: true })` bakes resolved values into declarations. No CSS variables at all. For email templates or `var(--)`-free environments.
- **`5. Scoped (MFE)`** — `createCssAdapter({ scope: "widget" })` namespaces all variable names. Prevents collisions when multiple micro-frontends share a page.
- **`6. Per-Component`** — `components.renderRecipe("buttons", "primary")` pulls CSS from all referenced subsystems (colors + typography + effects + layout) into one self-contained bundle per component.

## Key files

- **`src/theme.ts`** — three `createTheme` calls with different adapters: default, inline, scoped.
- **`src/main.ts`** — tabbed UI rendering each delivery style with live demos, generated CSS preview, and usage code.

## Key patterns

1. **Same raw theme, different adapter** — `createCssAdapter()` vs `createCssAdapter({ inline: true })` vs `createCssAdapter({ scope: "widget" })`.
2. **Per-call overrides** — scoped adapter + `{ inline: true }` per-call to get inlined values from a scoped theme.
3. **`theme.variablesCss` / `theme.recipesCss`** — split the full output for deferred loading.
4. **`renderRecipe`** — extract CSS for one recipe variant with only its dependencies.

## Run

```bash
npm install
npm run dev
```
