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

theme.components.getClass(g, v)    // "dt-color-solid-primary dt-type-btn-lg dt-comp-buttons-primary"
theme.components.classes           // { buttons: { primary: { classes: [...], className: "..." } } }
```

## Key features

- **CSS variables + single `:root`** across all subsystems. No duplicate wrappers.
- **Responsive via CSS cascade.** Property-level responsive entries emit `@media { :root { ... } }` overrides; recipes reference variables via `var(--...)` so breakpoint changes cascade automatically.
- **Recipes produce class names**, not framework-specific output. Works with React, Angular, plain HTML, or any other consumer.
- **IR (intermediate representation)** output alongside strings. Adapters can convert IR to styled-components RuleSets, Emotion objects, or any other format.
- **Subsystem architecture.** Colors, typography, layout, effects, and components all follow the same pattern.
- **Composition subsystem.** Combine recipes from multiple subsystems into unified component class names with minimal delta CSS.

## Documentation

| Document | Audience |
|---|---|
| [Core reference](docs/core/README.md) | Consumers + extenders: pipelines, stages, IR, helper contract |
| [Colors subsystem](docs/colors/README.md) | Consumers: input shapes, steps, recipes, CSS naming |
| [Typography subsystem](docs/typography/README.md) | Consumers: 9 properties, fontSize scale, recipes, CSS naming |
| [Layout subsystem](docs/layout/README.md) | Consumers: spacing, gutters, containers, columns, grids, stacks, recipes |
| [Effects subsystem](docs/effects/README.md) | Consumers: radius, shadow, blur, zIndex, opacity, outline, borderWidth, transitions |
| [Components subsystem](docs/components/README.md) | Consumers: cross-subsystem recipe composition, delta classes |
| [SC adapter](docs/adapters/styled-components/README.md) | Consumers: media templates, typographyMixin, DefaultTheme augmentation |
| [Architecture guide](AGENT.md) | Extenders: source structure, subsystem authoring, key decisions |

## Example apps

| App | Stack | What it shows |
|---|---|---|
| [colors-app](examples/colors-app/) | vanilla TS | Palette swatches, steps, recipe buttons |
| [typography-app](examples/typography-app/) | vanilla TS | Type scale, font variants, recipe text |
| [layout-app](examples/layout-app/) | vanilla TS | Spacing, containers, columns, grids, stacks |
| [effects-app](examples/effects-app/) | vanilla TS | Radius, shadow, opacity, border width, outline |
| [components-app](examples/components-app/) | vanilla TS | Cross-subsystem composition |
| [react-app](examples/react-app/) | React | Bare React, className-based, no SC |
| [react-sc-app](examples/react-sc-app/) | React + SC | Media templates, typographyMixin, direct tokens, CSS vars |
| [angular-app](examples/angular-app/) | Angular 19 | InjectionToken, class bindings, CSS variables, direct tokens |

## Framework integration

The core is framework-agnostic. Adapters provide ergonomic wrappers:

- **React + styled-components:** SC-wrapped media templates (`theme.media.md.min\`...\``), `typographyMixin`, `DefaultTheme` augmentation. See [SC adapter docs](docs/adapters/styled-components/README.md).
- **React (no SC):** `<style>{theme.css}</style>` + className strings. See [react-app example](examples/react-app/).
- **Angular:** Inject stylesheet at bootstrap, reference class names in templates. See [angular-app example](examples/angular-app/).
- **Any framework:** The output is CSS strings + class name strings. Use however your framework consumes CSS.

## License

MIT
