# Components (Composition) Example

Vanilla TypeScript — no framework, no styled-components.

## What to look for

- **`src/theme.ts`** — full theme with colors, typography, effects, and layout subsystems, plus `components.recipes` that reference recipes from each.
- **`src/main.ts`** — renders composed button and card components, shows the resolved class name breakdown, and displays the delta CSS output.
- **Cross-subsystem references** — `colors: "solid.primary"`, `typography: "button.large"`, `effects: "card.elevated"` resolve to existing subsystem class names.
- **Delta classes** — the `css:` overrides (cursor, border, padding, etc.) generate a single delta class. Referenced subsystem classes are reused, not duplicated.
- **`getClass()` output** — returns a combined className string like `"dt-color-solid-primary dt-type-button-large dt-comp-buttons-primary"` ready for `class="..."`.
- **`ResolvedComponentClass`** — `{ classes: string[], className: string }` — the `classes` array lets you inspect which subsystem classes are included.

## Run

```bash
npm install
npm run dev
```
