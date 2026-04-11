# Grid Data Source Concept

## Goals & Inspiration
- Provide the same "source of truth → helpers" pipeline we already use for palette/typography: preserve the authoring data, emit normalized tokens, CSS variables, and ready-to-use styled-components helpers.
- Match capabilities of Bootstrap/Tailwind/Chakra container + column systems (responsive container widths, configurable gutters, spacing scales) while keeping Theme Registry parity.
- Allow teams to define default containers derived from existing `theme.breakpoints`, but also extra "wide"/"narrow" containers that clamp width or stretch to 100% with optional `maxWidth` safeguards.
- Ship ergonomic APIs similar to Chakra's `Container`, Tailwind's `container` plugin, and CSS grid utility generators: prebuilt mixins for columns, gutters, spacing, and semantic layout styles.

## Example Input
```ts
const gridSource = {
  layout: {
    // canonical spacing tokens reused by gutters, insets, margins, etc.
    spacing: {
      // built-in zero token so authors can disable spacing without redefining it
      none: 0,
      default: 16,
      compact: 8,
      relaxed: {
        value: 30,
        responsive: [
          { breakpoint: 'xs', value: 8 },
          { breakpoint: 'sm', value: 15 },
          { breakpoint: 'md', value: 15 },
        ],
      },
      xs: 4,
      sm: 'compact',
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
    },
    // Optional named gutters for other layout primitives (stacks, tiles, etc.)
    gutters: {
      none: 'none',
      default: 'sm',
      tight: 'compact',
      loose: 40,
      hero: {
        token: '2xl',
        responsive: [{ breakpoint: 'lg', value: 56 }],
      },
    },
    // columns can also be provided as a bare number (see Columns Input Options). Expanded form shown here.
    columns: {
      size: 12,
      // gap between individual columns (maps to CSS column-gap/row-gap)
      gutter: {
        default: { token: 'md' },
        responsive: [
          { breakpoint: 'xs', value: 12 },
          { breakpoint: 'lg', token: 'xl' },
        ],
      },
      // padding applied to the grid wrapper before/after columns
      inset: {
        default: 'layout',
        responsive: [{ breakpoint: 'xl', value: 'relaxed' }],
      },
    },
    // container presets (default/wide/narrow...) built from breakpoints + spacing
    containers: {
      // fixed container derived from breakpoints; inset configurable only (mode locked)
      default: 'layout',
      // fixed container but clamped at md breakpoint (does not grow beyond md width)
      narrow: {
        mode: 'fixed',
        clampTo: { breakpoint: 'md' },
        inset: { token: 'sm' },
      },
      // fluid container (100% width) with optional breakpoint-based max width
      wide: {
        mode: 'fluid',
        maxWidth: { mode: 'breakpoint', value: 'xl' },
        inset: 'layout',
      },
      // fluid container using custom max width value
      hero: {
        mode: 'fluid',
        maxWidth: { mode: 'custom', value: '90vw' },
        inset: {
          responsive: [
            { breakpoint: 'xs', value: 'compact', query: 'max' },
            { breakpoint: 'md', value: 'layout' },
            { breakpoint: 'xl', value: 80, query: 'min' },
          ],
        },
      },
    },
    // semantic layout styles (padding/margins/gaps) similar to typography styles
    styles: {
      section: {
        default: {
          marginY: '2xl',
          paddingX: 'layout',
          background: 'transparent',
        },
        hero: {
          marginY: 'none',
          paddingX: 'wide',
          responsive: [
            { breakpoint: 'md', paddingX: 'relaxed' },
            { breakpoint: 'xl', paddingX: 80 },
          ],
        },
      },
      stack: {
        tight: {
          gap: 'compact',
        },
        relaxed: {
          gap: 'relaxed',
          responsive: [{ breakpoint: 'lg', gap: '2xl' }],
        },
      },
    },
  },
} as const;
```

### Spacing Input Options

**Simplified** – single value (number/string) maps to `spacing.default` automatically:

```ts
const layout = {
  spacing: 15, // normalized to { none: 0, default: '15px' }
};
```

**Advanced** – object with named tokens, responsive overrides, or inline values:

```ts
const layoutSpacing = {
  none: 0,
  default: 16,
  compact: 8,
  relaxed: {
    value: 30,
    responsive: [
      { breakpoint: 'xs', value: 8 },
      { breakpoint: 'sm', value: 15 },
      { breakpoint: 'md', value: 15 },
      { breakpoint: 'xl', token: '2xl', query: 'min' },
    ],
  },
  xs: 4,
  sm: 'compact', // alias existing token
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

### Gutter Input Options

**Simplified** – single number or spacing token reference:

```ts
const layoutGuttersSimple = 'sm'; // normalized to { default: { token: 'sm' } }

const layoutGuttersPx = 24; // normalized to { default: { value: 24 } }
```

**Advanced** – object mirroring spacing syntax for named presets:

```ts
const layoutGutters = {
  default: 'sm',
  tight: 'compact',
  loose: 40,
  hero: {
    token: '2xl',
    responsive: [{ breakpoint: 'lg', value: 56 }],
  },
};
```

### Columns Input Options

**Simplified** – number maps to `{ size, gutter, inset }`, where `gutter.default` uses the global `spacing.default` token and `inset` falls back to zero (`spacing.none`).

```ts
const layoutColumnsSimple = 12;
// normalized to {
//   size: 12,
//   gutter: { default: { token: 'default' } },
//   inset: { default: 'none' },
// }
```

**Advanced** – object with explicit overrides (any field optional):

```ts
const layoutColumns = {
  size: 12,
  gutter: {
    default: { token: 'md' },
    responsive: [{ breakpoint: 'xl', token: 'xl' }],
  },
  inset: {
    default: 'layout',
    responsive: [{ breakpoint: 'md', value: 'relaxed' }],
  },
};
```

### Container Input Options

Containers are always derived from `theme.breakpoints`; the builder combines breakpoint widths with optional insets and caps depending on the mode.

```ts
const layoutContainers = {
  default: 'layout', // shorthand => fixed container (mode locked) w/ layout inset
  narrow: {
    clampTo: { breakpoint: 'md' },
    inset: { token: 'sm' },
  },
  wide: {
    mode: 'fluid',
    maxWidth: { mode: 'breakpoint', value: 'xl' },
  },
  hero: {
    mode: 'fluid',
    maxWidth: { mode: 'custom', value: '90vw' },
    inset: {
      responsive: [
        { breakpoint: 'xs', value: 'compact', query: 'max' },
        { breakpoint: 'md', value: 'layout' },
      ],
    },
  },
};
```

- **Fixed** (default): width equals the current breakpoint width. `inset` controls padding. Use `clampTo` to stop growth beyond a target breakpoint (e.g., clamp to `md`). The `default` container is always fixed; `mode` is ignored for this key so only `inset` (and optional `clampTo`) are configurable.
- **Fluid** (`mode: 'fluid'`): width is 100%. Optional `maxWidth` lets you cap it using a breakpoint (`{ mode: 'breakpoint', value: 'xl' }`), custom measurement (`{ mode: 'custom', value: 1440 }` or `'90vw'`), or omit entirely (`{ mode: 'none' }`).
- `inset` follows the spacing schema; omit it to fall back to `spacing.none`.

### Layout Styles Input

Styled analog to typography `styles`: define semantic groups/variants that reference spacing/gutter tokens and accept responsive overrides.

```ts
const layoutStyles = {
  section: {
    default: {
      marginY: '2xl',
      paddingX: 'layout',
      background: 'transparent',
    },
    hero: {
      marginY: 'none',
      paddingX: 'wide',
      responsive: [
        { breakpoint: 'md', paddingX: 'relaxed' },
        { breakpoint: 'xl', paddingX: 80 },
      ],
    },
  },
  stack: {
    tight: {
      gap: 'compact',
    },
    relaxed: {
      gap: 'relaxed',
      responsive: [{ breakpoint: 'lg', gap: '2xl' }],
    },
  },
};
```

Notes:
- `spacing` is the single source of spacing truth. All other measurements (gutters, insets, layout styles) reference tokens from this scale unless overridden by raw values.
- Spacing values accept raw numbers/strings, aliases referencing other tokens (e.g., `sm: 'compact'`), or responsive overrides defined via arrays of `{ breakpoint, value|token, query? }` entries that mirror the typography responsive config.
- Every responsive override (`spacing.relaxed`, `columns.gutter`, container insets, layout styles, etc.) uses that same array-of-objects signature so the normalization logic is shared with typography.
- `spacing.none` is a reserved zero token injected during normalization. User-provided values for `none` are ignored so designers always have a reliable "no spacing" option.
- `columns` accepts either a number or an object. Numbers normalize to `{ size, gutter, inset }` using `spacing.default` and `spacing.none` as fallbacks, so `gutter`/`inset` are optional even in the expanded form.
- `columns.gutter` describes the intra-column spacing. We allow per-breakpoint overrides that can reference either a spacing token (`{ token: 'xl' }`) or explicit value (`{ value: 12 }`). This keeps column gutters aligned with the global spacing language while supporting bespoke tweaks.
- `columns.inset` describes the padding applied to the grid wrapper itself (before columns). Using named presets like `'layout' | 'compact' | 'relaxed'` lets design dictate default behavior, but we still allow direct token/value overrides.
- The optional top-level `gutters` block lets teams define named gutter presets for stacks/tiles. It follows the same shape as `spacing`, so entries can be raw numbers, spacing-token references, or responsive objects.
- `gutters.none` mirrors `spacing.none` and always resolves to zero gap. User overrides are ignored so zero-gap utilities stay consistent.
- `containers` derive from `theme.breakpoints`: the default (fixed) mode locks widths to breakpoint values while `clampTo` halts growth past a target breakpoint. The `default` container is permanently fixed (only `inset` + optional `clampTo` allowed). Switching other presets to `mode: 'fluid'` yields a 100% container with optional `maxWidth` caps (breakpoint/custom/none). `inset` reuses the spacing schema and defaults to `spacing.none`.
- `styles` is the semantic layer (mirroring typography styles) where teams define layout presets (sections, stacks, etc.) that reference spacing/gutter tokens. These styles will drive mixins/helpers and CSS variables so common blocks share consistent spacing.

### Why keep spacing, margins, and gutters separate?
- **Spacing scale**: canonical token list (`xs`, `sm`, `md`, …). Everything else references it to stay consistent.
- **Gutters/column spacing**: define the gaps between columns/rows. They often differ from outer margins (you may want `md` spacing for gutters even if the page margins are `2xl`). Keeping a separate structure lets us generate mixins like `gridGutter('tight')` without conflating them with section spacing.
- **Container inset**: padding applied to containers. It usually equals the global layout spacing but occasionally differs (e.g., hero container with more padding). Referencing spacing tokens keeps it aligned yet overridable per container.
- **Layout styles**: semantic presets (sections, stacks) that compose spacing/gutter tokens into ready-to-use margins, padding, and gaps.

Columns themselves rely on `columns.gutter` and `columns.inset`. The separate `gutters` block is optional sugar for other layout primitives (stack, tiles). If teams find it redundant they can omit it and lean solely on the column definition.

## Expected Output
```ts
const { tokens, helpers, toCSS } = buildGridTokens(gridSource, breakpoints);

// Tokens for runtime use
const colFractions = tokens.columns[6];        // 50 (percent of 12)
const gutterMd = tokens.columnGutters.md;      // resolved px
const spacingLg = tokens.spacing.lg;           // 24 (px)
const defaultContainer = tokens.containers.default.breakpoints.lg;
/*
{
  width: 992,
  paddingX: 24,
  innerWidth: 992 - 48,
}
*/
const wideContainerXL = tokens.containers.wide.breakpoints.xl;
/*
{
  width: '100%',
  maxWidth: undefined,
  paddingX: resolvedSpacing('layout'),
}
*/
const heroSection = tokens.styles.section.hero; // resolved padding/margins per breakpoint

// Helpers for styled-components
helpers.buildColumns();
helpers.buildContainer('wide');
helpers.spacing('lg');
helpers.gutter('tight');
helpers.layout('section', 'hero');
helpers.columnsMixin();
helpers.containerMixin('wide');
helpers.styleMixin('section', 'hero');

// CSS variables
const cssVariables = toCSS();
/*
  --dt-grid-columns: 12;
  --dt-grid-gutter--xs: 12px;
  --dt-grid-gutter--default: 16px;
  --dt-spacing--md: 16px;
  --dt-container--default--lg-max-width: 992px;
  --dt-container--hero--xl-inset: 80px;
  --dt-layout-section--hero-padding-x--xl: 80px;
*/
```

### Theme Helpers Exposed via `createTheme`

| Helper | Description |
|--------|-------------|
| `layoutTokens` | Normalized spacing, gutters, columns, containers, and styles derived from `theme.layout`. Automatically refreshes when layout source or breakpoints change. |
| `layoutCSS` | Serialized CSS variables plus generated classes (`.layout-container--*`, `.layout-column--*`, `.layout-section--*`, etc.). Drop into global styles to enable defaults. |
| `layoutSpacing(token)` | Looks up a spacing token (value + responsive overrides), honoring aliases. Throws if no layout source exists. |
| `layoutGutter(token)` | Same as `layoutSpacing` but for named gutter presets, handy for stacks/tiles. |
| `layoutColumns()` | Returns the normalized column config `{ size, gutter, inset }` so you can build custom grid mixins or components programmatically. |
| `layoutContainer(name)` | Returns the normalized container preset (mode, per-breakpoint widths, optional clamp/maxWidth, inset token). |
| `layoutStyle(group, variant)` | Returns semantic layout style definitions (margin/padding/gap/background) plus responsive overrides, mirroring typography styles. |
| `layoutColumnsMixin()` | Styled-components mixin that applies the resolved column grid (`display: grid`, template columns, responsive gutters/inset). Includes `.toString()` for CSS literals. |
| `layoutContainerMixin(name)` | Styled-components mixin for a container preset (fixed or fluid) with responsive padding/max-width baked in. Throws if the preset is missing. |
| `layoutStyleMixin(group, variant)` | Styled-components mixin for semantic layout styles (section, stack, etc.) with responsive overrides and `.toString()` serialization. |

## Comparison Targets & Differentiators
- **Bootstrap 5**: provides fixed container widths + gutters, but no tokenized outputs. We match their responsive containers while exposing both JS and CSS variable versions.
- **Chakra UI**: expressive spacing tokens and `Container` component; we align by using spacing scales and breakpoint-aware config while keeping raw source in the theme.
- **Tailwind container plugin**: auto center + clamp widths per breakpoint; our custom container definitions emulate this but let designers name and tune multiple variants (wide/narrow, etc.).
- **Styled System/Grid**: offers responsive props but requires manual theme wiring; our helpers auto-generate CSS and mixins from the single `gridSource` definition.

## Deliverables
1. `buildGridTokens(source, breakpoints, options)` returning normalized tokens for columns, gutters, spacing, layout styles, and containers.
2. `serializeGridToCSS(tokens, options)` emitting CSS variables under the theme prefix (`--dt-grid-…`).
3. Helper factories (`buildColumnHelpers`, `buildContainerHelpers`, `spacingMixin`, etc.) that consume tokens and existing `theme.media` to generate ready-to-use styled-components snippets.
4. Documentation mirroring this file plus examples (e.g., building a layout, spacing utilities).
