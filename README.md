# @4i4/theme-toolkit

Utilities that power the layout, color, media, and typography pipelines used by [`@4i4/theme-registry`](https://github.com/4i4-team/theme-registry). The toolkit ships design-token builders, CSS variable emitters, styled-components mixins, and theme helpers that stay in sync with your raw data sources.

## Installation

```bash
npm install @4i4/theme-toolkit
# or
yarn add @4i4/theme-toolkit
```

## Quick Start

```ts
import { DEFAULT_BREAKPOINTS, createTheme } from "@4i4/theme-toolkit";

const theme = createTheme(
  {
    breakpoints: DEFAULT_BREAKPOINTS,
    palette: {
      primary: { base: "#2251ff", text: "#fff" },
    },
    typography: minimalTypography,
    layout: layoutSource,
  },
  {
    media: { unit: "rem" },
    typography: { unit: "rem", prefix: "--brand" },
    layout: { prefix: "--brand" },
  },
);

// theme.media.xl.min`
// theme.layoutContainerMixin("default")
// theme.layoutStyle("section", "hero")
```

- `theme.media` exposes breakpoint helpers (`min`, `max`, `exact`, `between`).
- `theme.paletteTokens`, `theme.paletteCSS`, `theme.lightenColor`/`darkenColor` keep palettes in sync with your raw sources.
- `theme.typographyTokens`, `theme.typographyMixin`, and `theme.typographyCSS` deliver semantic text helpers.
- `theme.layout*` mirrors the new layout builder: spacing/gutter lookups, columns/container/style mixins, and a ready-to-use CSS bundle via `theme.layoutCSS`.

## Documentation

Each subsystem ships its own overview, data-source contract, and helper reference:

| Section | Docs |
|---------|------|
| Layout & Grid | [docs/layout/README.md](docs/layout/README.md) |
| Palette / Colors | [docs/colors/README.md](docs/colors/README.md) |

More sections (media, typography, components) will join the `docs/` folder as they are formalized.

## Subpath Imports

Every subsystem can be imported via its own subpath:

```ts
import { mediaQuery } from "@4i4/theme-toolkit/media";
import { buildPaletteTokens } from "@4i4/theme-toolkit/colors";
import { buildTypographyTokens } from "@4i4/theme-toolkit/typography";
import { buildGridTokens } from "@4i4/theme-toolkit/layout";
```

Refer to the docs for the complete API surface of each module.
