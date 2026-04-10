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
  media,
  container,
  buildColumn,
  buildPalettes,
  buildButtons,
} from "@4i4/theme-toolkit";

const breakpoints = DEFAULT_BREAKPOINTS;

const theme = {
  media: media(breakpoints),
  container: container(breakpoints),
  column: buildColumn(12, breakpoints),
  palettes: buildPalettes({
    primary: { main: "#2251ff", text: "#ffffff" },
  }),
  buttons: buildButtons(["primary"]),
};
```

## Modules

- **media-query** – breakpoint utilities (`DEFAULT_BREAKPOINTS`, `mediaQuery`, `media`), plus container helpers.
- **grid** – grid utilities (`container`, `buildColumn`, `buildBreakpointColumnSizes`, `columnSizes`).
- **colors** – color transforms (`convertHexToRGB`, `lighten`, `buildPalettes`, etc.).

All helpers are designed to work with styled-components themes.

## Color Utilities

The `colors` module exposes helper functions for palette composition and color transformations:

- `convertHexToRGB(hex)`: parse `#RGB`/`#RRGGBB` strings into `[r, g, b]` tuples.
- `convertRgbToHex(rgb)`: convert an `[r, g, b]` tuple back to a hex string.
- `convertHexToHue(hex)`: compute the hue (in degrees) for a hex color.
- `lighten(hex, percent)` / `darken(hex, percent)`: adjust color luminosity with 0–100% clamped input.
- `buildPalettes(palettes)`: generate CSS custom properties (e.g. `--color--primary`, `--color--primary--dark`).
- `buildButtons(types)`: derive button class helpers (`.btn-primary`, `.btn-primary-hollow`, etc.) from palette variables.

Default palette utilities expect the CSS variables produced by `buildPalettes`; override or extend them to match your theme naming conventions.

## Media Helpers Example

```ts
import styled from "styled-components";
import { DEFAULT_BREAKPOINTS, media } from "@4i4/theme-toolkit";

const theme = {
  media: media(DEFAULT_BREAKPOINTS),
};

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
```

Each breakpoint exposes `min`, `max`, and `exact` functions, so responsive tweaks can stay declarative inside styled-components. Use whichever syntax reads best—`theme.media.sm.min`/`max`/`exact` for per-breakpoint chaining or the global helpers `theme.media.min(key)`, `theme.media.max(key)`, and `theme.media.between(from, to)` (each accepts an optional `{ orientation: 'portrait' | 'landscape' }`).

For ad-hoc situations, `mediaQuery({ min, max })` is also exported so you can build a single media query without wiring it into the theme:

```ts
import { css } from "styled-components";
import { mediaQuery } from "@4i4/theme-toolkit";

const threeColumn = css`
  display: grid;
  ${mediaQuery({ min: 768, orientation: "landscape" })`
    grid-template-columns: repeat(3, 1fr);
  `}
`;
```

## Grid Utilities

Grid helpers build on the media utilities to create responsive column layouts.

```ts
import styled from "styled-components";
import {
  DEFAULT_BREAKPOINTS,
  media,
  container,
  buildColumn,
  columnSizes,
} from "@4i4/theme-toolkit";

const breakpoints = DEFAULT_BREAKPOINTS;

export const Theme = {
  media: media(breakpoints),
  container: container(breakpoints),
  column: buildColumn(12, breakpoints),
  columnSizes: columnSizes(12),
};

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
import type { DefaultBreakpoints } from "@4i4/theme-toolkit";

declare module "styled-components" {
  // adjust the palette/button typing to your project needs
  interface DefaultTheme {
    media: ReturnType<typeof import("@4i4/theme-toolkit").media<keyof DefaultBreakpoints>>;
    container: ReturnType<typeof import("@4i4/theme-toolkit").container<keyof DefaultBreakpoints>>;
    column: ReturnType<typeof import("@4i4/theme-toolkit").buildColumn<keyof DefaultBreakpoints>>;
    palettes: ReturnType<typeof import("@4i4/theme-toolkit").buildPalettes>;
    buttons: ReturnType<typeof import("@4i4/theme-toolkit").buildButtons>;
  }
}
```

## Button Helpers

`buildButtons(["primary"])` generates class name helpers:

- `.btn-primary`
- `.btn-primary-hollow`
- `.btn-primary-link`

All variants rely on the CSS variables created by `buildPalettes`. Customize the palette map or extend the button helper to suit your design system.

## Custom Breakpoints

`DEFAULT_BREAKPOINTS` matches the toolkit’s out-of-the-box layout setup. To use your own:

```ts
const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

const theme = {
  media: media(BREAKPOINTS),
  container: container(BREAKPOINTS),
  column: buildColumn(12, BREAKPOINTS),
};
```

Any string keys are supported; they flow through to `theme.media.<key>` and the generated grid class names.
