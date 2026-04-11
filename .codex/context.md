# @4i4/theme-toolkit Snapshot

## Package Purpose
- Styled-components-focused design-token toolkit (media, palette, typography, grid, buttons).
- Complements @4i4/theme-registry by generating tokens + CSS vars from raw source data.
- Exposes ergonomic helpers (`theme.media.*`, `theme.paletteCSS`, `theme.typographyMixin`, `buildContainers`, etc.).

## Goals
- Preserve raw sources in the theme so child overrides auto-reflow into helpers.
- Auto-generate normalized tokens and CSS variables for media/palette/typography.
- Provide styled-components mixins/fragments for semantic usage (media queries, typography, containers).
- Reach parity with other design-token frameworks on modular scales/responsive helpers.

## Comparison Targets
- Theme UI / Chakra UI / Tailwind (design-token definition + semantic typography).
- styled-media-query / styled-breakpoints (media helper ergonomics).
- Style Dictionary (token → CSS variable pipelines).
- Container/grid behaviors from frameworks like Bootstrap/Chakra.

