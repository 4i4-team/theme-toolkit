# @4i4/theme-toolkit

A collection of layout and color utilities for styled-components themes, designed to complement [`@4i4/theme-registry`](https://github.com/4i4-team/theme-registry).

## Installation

```
npm install @4i4/theme-toolkit
# or
yarn add @4i4/theme-toolkit
```

## Usage

```ts
import {
  DEFAULT_BREAKPOINTS,
  container,
  buildColumn,
  createTheme,
  buildButtons,
} from "@4i4/theme-toolkit";

const theme = createTheme({
  breakpoints: DEFAULT_BREAKPOINTS,
  palette: {
    primary: {
      base: "#2251ff",
      text: "#ffffff",
      steps: [50, 100, 200, 300, 400, 500, 600],
    },
  },
  typography: minimalTypography,
  container: container(DEFAULT_BREAKPOINTS),
  column: buildColumn(12, DEFAULT_BREAKPOINTS),
  buttons: buildButtons(["primary"]),
});

// Switch to rem-based queries powered by your typography base size
const remTheme = createTheme(
  {
    breakpoints: DEFAULT_BREAKPOINTS,
    typography: {
      ...minimalTypography,
      scale: {
        ...minimalTypography.scale,
        baseFontSize: 18,
      },
    },
    palette: {
      primary: { base: "#2251ff", text: "#fff" },
    },
  },
  { media: { unit: "rem" }, palette: { prefix: "--brand" }, typography: { unit: "rem" } },
);
```

`createTheme` wires getters so `theme.media` always reflects the current `theme.breakpoints` (and typography base size) and `theme.paletteTokens`/`theme.paletteCSS` stay in sync with the palette source. Override the breakpoint map or palette in derived themes and the helpers update automatically. Typographic mixins follow the same pattern using `theme.typographyMixin(group, variant)`.

## Modules

- **media-query** – breakpoint utilities (`DEFAULT_BREAKPOINTS`, `mediaQuery`, `media`), plus container helpers.
- **theme** – utilities for composing themes (`createTheme`).
- **grid** – grid utilities (`container`, `buildColumn`, `buildBreakpointColumnSizes`, `columnSizes`).
- **colors** – color transforms (`convertHexToRGB`, `lighten`, `buildPaletteTokens`, etc.).
- **buttons** – button class helpers (`buildButtons`).

All helpers are designed to work with styled-components themes.

## Color Utilities

The `colors` module exposes helper functions for palette composition and color transformations:

- `convertHexToRGB(hex)`: parse `#RGB`/`#RRGGBB` strings into `[r, g, b]` tuples.
- `convertRgbToHex(rgb)`: convert an `[r, g, b]` tuple back to a hex string.
- `convertHexToHue(hex)`: compute the hue (in degrees) for a hex color.
- `lighten(hex, percent)` / `darken(hex, percent)`: adjust color luminosity with 0–100% clamped input.
- `buildPaletteTokens(paletteSource, options)`: generate design tokens and CSS variables from a palette data source.
- `buildButtons(types)`: derive button class helpers (`.btn-primary`, `.btn-primary-hollow`, etc.) that rely on your CSS variables.

Default palette utilities expect the CSS variables produced by `buildPaletteTokens`; override or extend them to match your theme naming conventions.

## Typography

Provide a typography data source to drive modular scales, font families, and semantic text styles.

```ts
import { buildTypographyTokens } from "@4i4/theme-toolkit";

const minimalTypography = {
  families: {
    base: "Inter, sans-serif",
    heading: "Inter, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
  letterSpacings: {
    tighter: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
  scale: {
    baseFontSize: 16,
    ratio: "major-third",
    unit: "rem",
  },
  styles: {
    body: {
      md: {
        family: "base",
        size: "md",
        weight: "regular",
        lineHeight: "normal",
        letterSpacing: "normal",
        responsive: [
          { breakpoint: "sm", size: "sm", query: "max" },
          { breakpoint: "lg", size: "lg", query: "min" },
        ],
      },
    },
  },
};

const fullTypography = {
  ...minimalTypography,
  scale: {
    ...minimalTypography.scale,
    precision: 4,
    steps: {
      xs: -2,
      sm: -1,
      md: 0,
      lg: 1,
      xl: 2,
      "2xl": 3,
      "3xl": 4,
      "4xl": 5,
    },
    variants: {
      md: 18,
      lg: 22,
    },
  },
  styles: {
    ...minimalTypography.styles,
    heading: {
      h1: {
        family: "heading",
        size: "4xl",
        weight: "bold",
        lineHeight: "tight",
        letterSpacing: "tighter",
      },
      h2: {
        family: "heading",
        size: "3xl",
        weight: "bold",
        lineHeight: "tight",
        letterSpacing: "tighter",
      },
    },
    label: {
      sm: {
        family: "base",
        size: "xs",
        weight: "medium",
        lineHeight: "normal",
        letterSpacing: "wide",
      },
    },
    code: {
      md: {
        family: "mono",
        size: "sm",
        weight: "regular",
        lineHeight: "normal",
        letterSpacing: "normal",
      },
    },
  },
};

const typography = buildTypographyTokens(fullTypography);
const typographyCSS = serializeTypographyToCSS(typography);
```

Use the tokens to inject CSS variables or drive styled-components mixins. Control whether the generated scale uses `px` or `rem` via `createTheme(..., { typography: { unit: 'rem' } })`, and apply the CSS variables with `typographyCSS` or `theme.typographyCSS`. Include optional `responsive` entries per style to alter size/weight/line-height at specific breakpoints (`query` accepts `min`, `max`, or `exact`).

## Media Helpers Example

```ts
import styled from "styled-components";
import {
  DEFAULT_BREAKPOINTS,
  createTheme,
  media,
  mediaQuery,
} from "@4i4/theme-toolkit";

const theme = createTheme({
  breakpoints: DEFAULT_BREAKPOINTS,
  palette: {
    primary: { base: "#2251ff", text: "#ffffff" },
  },
});

export const Wrapper = styled.div`
  padding: 16px;

  ${({ theme }) => theme.media.sm.max`
    padding: 12px;
  `}

  ${({ theme }) => theme.media.lg.min`
    padding: 24px;
  `}

  ${({ theme }) => theme.media.between("md", "xl")`
    background: red;
  `}
`;

// Global helpers mirror the per-breakpoint ones:
theme.media.min("lg")`font-size: 20px;`;
theme.media.max("sm")`display: none;`;
theme.media.between("sm", "lg", { orientation: "portrait" })`
  flex-direction: column;
`;

// String form if you need to plug into another CSS-in-JS system
const portraitQuery = theme.media.sm.max.query;

// Manual helpers can opt into em/rem directly
const emMedia = media(DEFAULT_BREAKPOINTS, {
  unit: "em",
  baseFontSize: 18,
});
```

`createTheme` wires getters so `theme.media` and `theme.paletteTokens` always reflect the current theme sources. Inject `theme.paletteCSS` once (e.g., with `createGlobalStyle`) to expose the generated CSS variables, and use `theme.lightenColor(name, percent)` / `theme.darkenColor(name, percent)` to derive palette-aware adjustments without re-specifying hex codes.
```ts
const GlobalStyles = createGlobalStyle`
  :root {
    ${({ theme }) => theme.paletteCSS}
    ${({ theme }) => theme.typographyCSS}
  }
`;

// Palette-aware color adjustments
const Button = styled.button`
  background: ${({ theme }) => theme.darkenColor("primary", 10)};
  color: ${({ theme }) => theme.lightenColor("primary", 60)};
`;

// Typography mixins
const Heading = styled.h1`
  ${({ theme }) => theme.typographyMixin("heading", "h1")}
  // Responsive adjustments configured in the typography source apply automatically
`;

```

### `createTheme` Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| `breakpoints` | `Record<string, number>` | Named viewport widths used by the media helpers. |
| `palette` | `Record<string, PaletteSource>` | Color data sources consumed by `buildPaletteTokens`. |
| `typography` | `TypographySource` | Typography data source (families, scale, styles). |
| `container`, `column`, etc. | Styled-components mixins | Optional helpers you pass through untouched. |

`createTheme` also accepts an options object mirroring each subsystem:

| Option | Default | Description |
|--------|---------|-------------|
| `media.unit` | `px` | Output unit for breakpoint helpers (`px`, `em`, `rem`). |
| `media.baseFontSize` | inferred from typography or `16` | Root font size for rem/em conversions. |
| `palette.prefix` | `--dt` | Prefix for palette CSS variables. |
| `typography.unit` | `px` | Unit for typography scale values (`px` or `rem`). |
| `typography.prefix` | `--dt` | Prefix for typography CSS variables. |

### `createTheme` Outputs

| Property | Type | Description |
|----------|------|-------------|
| `media` | `MediaHelpers` | Tagged template helpers (`theme.media.sm.min`, `.max`, `.between`) with `.query`. |
| `paletteTokens` | `Record<string, PaletteTokens>` | Normalized palette tokens for programmatic consumption. |
| `paletteCSS` | `string` | CSS custom properties derived from the palette tokens. |
| `lightenColor` / `darkenColor` | `(name, percent) => string` | Palette-aware color adjustments using the base color for `name`. |
| `typographyTokens` | `TypographyTokens` | Normalized typography tokens (families, scale, styles). |
| `typographyCSS` | `string` | CSS variables for typography (font families, sizes, etc.). |
| `typographyMixin` | `(group, variant) => css` | Styled-components fragment for semantic typography styles (honors any `responsive` overrides defined in the typography source). |

Each breakpoint exposes `min`, `max`, and `exact` functions that now double as tagged templates (for styled-components) and expose their raw `@media` string via the `.query` property. Use whichever syntax reads best—`theme.media.sm.min`/`max`/`exact` for per-breakpoint chaining or the global helpers `theme.media.min(key)`, `theme.media.max(key)`, and `theme.media.between(from, to)` (each accepts an optional `{ orientation: 'portrait' | 'landscape' }`). Configure width units globally with `media(breakpoints, { unit: 'em' | 'rem', baseFontSize })` or let `createTheme` infer the base from `typography.rootFontSize`.

For ad-hoc situations, `mediaQuery({ min, max })` is also exported so you can build a single media query without wiring it into the theme:

```ts
import { css } from "styled-components";
import { mediaQuery } from "@4i4/theme-toolkit";

const rule = mediaQuery({ min: 768, orientation: "landscape" }, { unit: "em" });

const threeColumn = css`
  display: grid;

  ${rule} {
    grid-template-columns: repeat(3, 1fr);
  }
`;
```

## Grid Utilities

Grid helpers build on the media utilities to create responsive column layouts.

```ts
import styled from "styled-components";
import {
  DEFAULT_BREAKPOINTS,
  createTheme,
  container,
  buildColumn,
  columnSizes,
} from "@4i4/theme-toolkit";

const breakpoints = DEFAULT_BREAKPOINTS;

export const Theme = createTheme({
  breakpoints,
  container: container(breakpoints),
  column: buildColumn(12, breakpoints),
  columnSizes: columnSizes(12),
});

export const Container = styled.div`
  ${({ theme }) => theme.container}
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 16px;
`;

export const Column = styled.div`
  ${({ theme }) => theme.column}
`;

// Usage: <Column className="md-6 lg-4" /> will span 6 columns on md, 4 on lg
```

`columnSizes(size)` returns a numeric map of percentage widths that you can wire into class names or CSS custom properties as needed.

## Integrating With styled-components Themes

Extend your `DefaultTheme` to include the helpers you consume:

```ts
import "styled-components";
import type {
  DefaultBreakpoints,
  MediaHelpers,
  PaletteTokens,
  TypographyTokens,
} from "@4i4/theme-toolkit";

declare module "styled-components" {
  // adjust the palette/button typing to your project needs
  interface DefaultTheme {
    media: MediaHelpers<keyof DefaultBreakpoints>;
    container: ReturnType<typeof import("@4i4/theme-toolkit").container<keyof DefaultBreakpoints>>;
    column: ReturnType<typeof import("@4i4/theme-toolkit").buildColumn<keyof DefaultBreakpoints>>;
    paletteTokens: Record<string, PaletteTokens>;
    paletteCSS: string;
    lightenColor: (name: string, percent: number) => string;
    darkenColor: (name: string, percent: number) => string;
    typographyTokens?: TypographyTokens;
    typographyCSS: string;
    typographyMixin: (
      group: string,
      variant: string,
    ) => ReturnType<typeof import("@4i4/theme-toolkit").typographyMixin>;
    buttons: ReturnType<typeof import("@4i4/theme-toolkit").buildButtons>;
  }
}
```

## Button Helpers

`buildButtons(["primary"])` generates class name helpers:

- `.btn-primary`
- `.btn-primary-hollow`
- `.btn-primary-link`

All variants rely on the CSS variables created by `buildPaletteTokens`. Customize the palette map or extend the button helper to suit your design system.

## Custom Breakpoints

`DEFAULT_BREAKPOINTS` matches the toolkit’s out-of-the-box layout setup. To use your own:

```ts
const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

const theme = createTheme({
  breakpoints: BREAKPOINTS,
  container: container(BREAKPOINTS),
  column: buildColumn(12, BREAKPOINTS),
});
```

Any string keys are supported; they flow through to `theme.media.<key>` and the generated grid class names.
