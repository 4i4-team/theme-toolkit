# Effects Tokens

Design systems often need non-structural primitives that sit between layout and component styles: radius scales, elevation presets, drop shadows, blur/opacity tokens, z-index ranges, and shared motion/transition values. The Effects subsystem mirrors our palette/typography/layout builders by keeping all of those surface-level tokens in one normalized source of truth that can emit runtime helpers, CSS variables, and utility classes.

## Goals
- Provide a declarative schema for radius, elevation, shadows, blur, z-index, opacity, and transition tokens.
- Normalize raw values (numbers → px strings, multi-stop shadows → serialized strings) so mixins and CSS classes stay consistent across the app.
- Emit CSS variables (`--dt-radius--md`, `--dt-shadow--xl`, etc.) and optional utility classes (e.g., `.dt-radius-md`, `.dt-shadow-lg`) alongside the tokens.
- Surface runtime helpers (`theme.effects.radius('md')`, `theme.effects.shadow('card')`, etc.) that mirror the builder.
- Keep the schema modular so future effects (e.g., border widths, filter tokens) can be added easily.

## Example Input

```ts
const effectsSource = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 16,
    pill: 999,
    button: {
      value: 12,
      responsive: [
        { breakpoint: 'sm', value: 8 },
        { breakpoint: 'lg', value: 20 },
      ],
    },
  },
  styles: {
    surface: {
      card: {
        radius: 'md',
        shadow: 'card',
        background: '#fff',
        zIndex: 'base',
      },
      modal: {
        radius: 'lg',
        shadow: 'overlay',
        background: '#fff',
        zIndex: 'modal',
        blur: 'md',
        opacity: 'overlay',
      },
    },
  },
  shadows: {
    card: {
      offsetX: "0",
      offsetY: "10px",
      blur: "20px",
      spread: "0",
      color: "rgba(0,0,0,0.15)",
    },
    overlay: [
      {
        offsetX: "0",
        offsetY: "15px",
        blur: "35px",
        spread: "-5px",
        color: { token: "overlay", opacity: 0.4 },
      },
      {
        inset: true,
        offsetX: "0",
        offsetY: "0",
        blur: "1px",
        spread: "0",
        color: { token: "surface", opacity: 0.2 },
      },
    ],
  },
 blur: {
   sm: "4px",
   md: "12px",
 },
 zIndex: {
   base: 0,
    dropdown: 1000,
    modal: 1300,
    toast: 1500,
  },
 opacity: {
   disabled: 0.4,
   overlay: 0.6,
 },
  transitions: {
    quick: { duration: "150ms", timing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    snappy: { duration: "250ms", timing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  },
} as const;
```

### Radius Input Options

**Simplified** – single number/string maps to `radius.default` automatically (and injects `radius.none = 0px` for consistency):

```ts
const effects = {
  radius: 12, // normalized to { none: 0, default: '12px' }
};
```

**Advanced** – object with named tokens, aliases, and responsive overrides (mirrors layout spacing):

```ts
const radius = {
  default: 8,
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
  cta: {
    token: 'lg',
    responsive: [
      { breakpoint: 'sm', value: 12 },
      { breakpoint: 'xl', token: 'pill' },
    ],
  },
};

// `none` is reserved and always resolves to 0px so teams have a consistent "no radius" option.
```

### Blur Input Options

Blur tokens mirror the radius schema.

```ts
const blur = 4; // normalized to { none: 0, default: '4px' }
```

**Advanced** – object with `default` plus named variants (aliases and responsive overrides allowed). `blur.none = 0px` is injected.

```ts
const blurScale = {
  default: '4px',
  md: '12px',
  heavy: {
    token: 'md',
    responsive: [{ breakpoint: 'lg', value: '20px' }],
  },
};
```

### Z-index Input Options

Just like blur/radius, z-index accepts a scalar or map. `zIndex.none = 0` is injected automatically, and responsive overrides use the same signature.

```ts
const zIndex = 100; // normalized to { none: 0, default: 100 }
```

**Advanced**

```ts
const zIndexScale = {
  default: 0,
  dropdown: 1000,
  modal: {
    value: 1300,
    responsive: [{ breakpoint: 'lg', value: 1400 }],
  },
};
```

### Opacity Input Options

Opacity scales follow the same pattern (with `opacity.none = 0`).

```ts
const opacity = 1; // normalized to { none: 0, default: 1 }
```

**Advanced**

```ts
const opacityScale = {
  default: 1,
  disabled: 0.4,
  overlay: {
    value: 0.6,
    responsive: [{ breakpoint: 'lg', value: 0.5 }],
  },
};
```

### Shadow Input Options

Each shadow token can be a single stop or an array of stops. Every stop requires `offsetX`, `offsetY`, `blur`, `spread`, and `color`, plus optional `inset`.

- `color` accepts either a raw CSS string or a palette reference `{ token: 'overlay', opacity?: number }`. When a token is provided, the builder resolves it to the palette color and applies the optional opacity multiplier.
- Arrays let you create layered shadows (e.g., drop + inset glows) under a single semantic name.
- Shadows can also provide responsive overrides via `{ breakpoint, value|token, query? }` so you can swap the referenced shadow per breakpoint.

```ts
const shadows = {
  card: { offsetX: '0', offsetY: '10px', blur: '20px', spread: '0', color: 'rgba(0,0,0,0.15)' },
  overlay: [
    {
      offsetX: '0',
      offsetY: '15px',
      blur: '35px',
      spread: '-5px',
      color: { token: 'overlay', opacity: 0.4 },
    },
    {
      inset: true,
      offsetX: '0',
      offsetY: '0',
      blur: '1px',
      spread: '0',
      color: { token: 'surface', opacity: 0.2 },
    },
  ],
  hero: {
    value: 'card',
    responsive: [{ breakpoint: 'lg', value: 'overlay' }],
  },
};
```

## Output & Helpers

The builder (`buildEffectsTokens(effectsSource)`) produces:

```ts
const effects = buildEffectsTokens(effectsSource);

effects.radius.md.value;          // "8px"
effects.radius.button.responsive; // [{ breakpoint: 'sm', ... }]
effects.shadows.card;             // "0 10px 20px 0 rgba(0,0,0,0.15)"
effects.zIndex.modal.value;       // "1300"
effects.opacity.disabled.value;   // "0.4"
effects.transitions.quick // { duration: "150ms", timing: "cubic-bezier(0.4, 0, 0.2, 1)" }
```

When fed through `createTheme`, the following helpers become available:

| Helper | Description |
|--------|-------------|
| `effectsTokens` | Normalized radius/style/shadow/blur/zIndex/opacity/transition maps. |
| `effectsCSS` | Serialized CSS variables (e.g., `--dt-radius--md`, `--dt-shadow--card`). |
| `effects.radius(name)` | Lookup for a radius token (returns px string). |
| `effects.shadow(name)` | Lookup for a shadow string. |
| `effects.style(group, variant)` | Lookup for semantic effect styles (radius/shadow/background/z-index bundles). |
| `effects.blur(name)` | Lookup for blur tokens (`value` + responsive overrides). |
| `effects.zIndex(name)` | Lookup for z-index tokens (`value` as string) with responsive overrides. |
| `effects.opacity(name)` | Lookup for opacity tokens (`value` as string) with responsive overrides. |
| `effects.transition(name)` | Returns `{ duration, timing }`. |
| `effects.radiusClass(name)` | Optional utility class builder (e.g., `.dt-radius-md`). |
| `effects.shadowClass(name)` | Utility class builder for drop shadows. |
| `effects.mixins.radius(name)` | Styled-components mixin for border-radius. |
| `effects.mixins.shadow(name)` | Styled-components mixin for box-shadow. |

## CSS Variables & Utility Classes

When `effectsCSS` is injected into global styles, you get:

```css
:root {
  --dt-radius--sm: 4px;
  --dt-radius--md: 8px;
  --dt-shadow--card: 0 10px 20px 0 rgba(0,0,0,0.15);
  --dt-z-index--modal: 1300;
  --dt-opacity--disabled: 0.4;
  --dt-transition--quick-duration: 150ms;
  --dt-transition--quick-timing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Optional utility classes (prefixed via `effects.classPrefix`, default `dt`):

```css
.dt-radius-md { border-radius: var(--dt-radius--md); }
.dt-shadow-card { box-shadow: var(--dt-shadow--card); }
.dt-blur-md { backdrop-filter: blur(var(--dt-blur--md)); }
.dt-opacity-disabled { opacity: var(--dt-opacity--disabled); }
```

## Comparison Targets
- **Chakra UI**: `theme.radii`, `theme.shadows`, `theme.zIndices`, `theme.blur`, etc. Effects mirrors these but adds CSS variables and mixins automatically.
- **MUI**: `theme.shape`, `theme.shadows`, `theme.zIndex`. Effects offers similar data but normalized and with runtime helpers.
- **Tailwind**: per-scale configs for `borderRadius`, `boxShadow`, `zIndex`, `opacity`, `blur`. Effects consolidates those into one authoring schema.

## Deliverables
1. `buildEffectsTokens(config)` → normalized token maps.
2. CSS serialization (variables + optional utility classes).
3. Runtime helpers/mixins accessible via `theme.effects.*`.
4. Documentation & example usage.
