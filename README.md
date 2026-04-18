# @theme-registry/theme-kit

Design-token engine and recipe system for building framework-agnostic UI kits. Turns a raw theme definition into normalized tokens, CSS custom properties, responsive variable overrides, and deterministic recipe class names.

Part of the [`@theme-registry`](https://github.com/theme-registry) ecosystem. Works standalone or alongside `@theme-registry/toolkit` for the full extendable-UI-kit story.

## Install

```bash
npm install @theme-registry/theme-kit
```

## Quick start

```ts
import { createTheme } from "@theme-registry/theme-kit";

const theme = createTheme({
  breakpoints: { sm: 576, md: 768, lg: 1024, xl: 1280 },
  colors: {
    primary:   { base: "#d0021b", text: "#ffffff" },
    secondary: { base: "#007bff", text: "#ffffff" },
    recipes: {
      solid: {
        primary:   { background: "primary", color: "primary.text" },
        secondary: { background: "secondary", color: "secondary.text" },
      },
    },
  },
}, { palette: { prefix: "brand" } });
```

Inject the generated stylesheet once at your app root:

```html
<style>${theme.css}</style>
```

Use recipe class names on any element:

```html
<button class="${theme.colors.getClass('solid', 'primary')}">Save</button>
```

## What you get

```ts
theme.css                          // full CSS string (single :root + recipes)
theme.nodes                        // full IR (CssNode[]) for custom renderers

theme.colors.primary               // raw input passthrough
theme.colors.tokens                // { primary: { text, variants: { main, light, dark, ... } } }
theme.colors.variables             // CssVariablesNode[] (variable IR)
theme.colors.nodes                 // CssNode[] (variables + recipe rules)
theme.colors.classes               // { solid: { primary: "brand-solid-primary", ... } }
theme.colors.getClass(group, var)  // convenience lookup
theme.colors.lighten(name, pct)    // computed color helper
theme.colors.darken(name, pct)     // computed color helper
theme.colors.recipes               // raw recipe definitions (passthrough)

theme.media.md.min                 // "@media (min-width: 768px)"
theme.media.md.exact               // "@media (min-width: 768px) and (max-width: 1023.98px)"
theme.media.between("sm", "lg")    // "@media (min-width: 576px) and (max-width: 1023.98px)"
```

## Key features

- **CSS variables + single `:root`** across all subsystems. No duplicate wrappers.
- **Responsive via CSS cascade.** Property-level responsive entries emit `@media { :root { ... } }` overrides; recipes reference variables via `var(--...)` so breakpoint changes cascade automatically.
- **Recipes produce class names**, not framework-specific output. Works with React, Angular, plain HTML, or any other consumer.
- **IR (intermediate representation)** output alongside strings. Adapters can convert IR to styled-components RuleSets, Emotion objects, or any other format.
- **Subsystem architecture.** Colors is the reference implementation; typography, layout, media, and effects follow the same pattern.

## Documentation

| Document | Audience |
|---|---|
| [Core reference](docs/core/README.md) | Consumers + extenders: pipelines, stages, IR, helper contract |
| [Colors subsystem](docs/colors/README.md) | Consumers: input shapes, steps, recipes, CSS naming |
| [Typography subsystem](docs/typography/README.md) | Consumers: 9 properties, fontSize scale, recipes, CSS naming |
| [Layout subsystem](docs/layout/README.md) | Consumers: spacing, gutters, containers, columns, grids, stacks, recipes |
| [Architecture guide](AGENT.md) | Extenders: source structure, subsystem authoring, key decisions |

## Framework integration

The core is framework-agnostic. Adapters provide ergonomic wrappers:

- **React + styled-components:** SC-wrapped media templates (`theme.media.md.min\`...\``), `DefaultTheme` augmentation.
- **React (no SC):** `<style>{theme.css}</style>` + className strings.
- **Angular:** Inject stylesheet at bootstrap, reference class names in templates.
- **Any framework:** The output is CSS strings + class name strings. Use however your framework consumes CSS.

## License

MIT
