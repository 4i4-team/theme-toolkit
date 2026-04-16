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

## Responsive Override Contract
- Every token builder that supports responsiveness (`spacing`, `radius`, `blur`, `opacity`, `zIndex`, layout/effect styles, etc.) uses the same structure:
- The `responsive` shape follows the parent schema. Every entry extends the base properties (radius fields, style fields, shadow fields, etc.) so you can inline overrides without a special wrapper:
  ```ts
  responsive?: Array<{
    breakpoint: string;
    query?: 'min' | 'max' | 'exact'; // defaults to 'exact'
    token?: string; // reference another named token (swap behavior)
    // all other fields from the parent definition are allowed here
  }>;
  ```
- For simple scalar tokens (spacing, radius, blur, opacity, zIndex) you either provide `token` (swap to another named entry) or override the scalar properties directly (`value`, etc.). The builder normalizes numbers → px strings when needed.
- For composite tokens (layout/effect styles, shadows, containers) you can override any of the parent properties inside the responsive entry (e.g., change `offsetY`/`blur` on a shadow, tweak `paddingX` on a style) or point to another preset via `token`.
- `query` controls how the breakpoint is applied:
  - `exact` (default) → `[min: breakpoint, max: nextBreakpoint)`
  - `min` → `@media (min-width: breakpoint)`
  - `max` → `@media (max-width: breakpoint)`
- This contract keeps responsive behavior consistent across all subsystems: you can either swap to another token by name or override fields inline for a given breakpoint without inventing subsystem-specific syntax.
