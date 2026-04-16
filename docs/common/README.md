# Common Theme Utilities

The common utilities provide the building blocks required by the architecture plan in `.codex/theme-architecture-for-codex.md` and the responsive contract in `.codex/context.md` / `.codex/plan.md`. All subsystems (layout, typography, effects, etc.) should consume these helpers instead of rolling bespoke logic as we start the subsystem-by-subsystem clean-up.

## Exposed helpers

| Helper | Purpose |
| --- | --- |
| `Breakpoints` / `NormalizedBreakpoints` | Shared breakpoint source/normalized types to keep responsive helpers aligned with `theme.breakpoints`. |
| `normalizePropertyValue` | Normalizes primitive or extended property definitions into the canonical `{ base, responsive, variants }` shape. Handles responsive defaults and variant inheritance. |
| `normalizeResponsiveOverrides` | Applies default queries (`exact`), validates `breakpoint`, and guarantees responsive entries follow the architecture contract (`variant` + inline overrides). |
| `normalizeCssVariablePrefix` / `normalizeCssClassPrefix` | Centralized prefix normalization so CSS variables/classes are deterministic across subsystems. |
| `sanitizeIdentifierSegment` | Common slug generator for CSS variable/class segments. |
| `createDependencyCache` | Getter cache helper (WeakMap-backed) for memoizing utilities per dependency slice (e.g., breakpoints, subsystem slices). |
| `buildMediaDescriptor` / `mediaQueryString` / `resolveMediaConfig` | Framework-agnostic media query helpers shared by all subsystems (provide sorted breakpoint descriptors and query strings). |
| `generateTokens` | Shared reducer that converts normalized property maps into token maps via a provided builder callback. |
| `generateTokens` (contract) | Normalized properties → subsystem token map; each subsystem implements its own mapper against the shared normal forms. |
| `generateCssVariables` | Shared helper for turning token maps into CSS variable dictionaries (respects prefixes, custom mapping). |
| `renderAllCssVariables` | Aggregates per-subsystem CSS variable maps into a CSS string (e.g., `:root { ... }`). |
| `normalizeRecipeGroup` | Normalizes recipe groups into `{ base, responsive }` variants with breakpoint/variant validation. |
| `renderAllCssVariables` | Aggregates CSS variable maps from every subsystem and emits a single CSS string (e.g., `:root { ... }`). |
| `interpretRecipe` (contract) | Subsystem-specific recipe interpreter: raw recipe props → canonical instruction object. |
| `generateRecipeCss` | Shared serializer that turns interpreted recipes into CSS, including responsive media blocks. |
| `assignRecipeClasses` | Deterministic class-name generator for recipe CSS (uses class prefixes + recipe path). |
| `defineCachedGetter` | Helper for wiring theme getters that cache by dependency (breakpoints, subsystem slices, etc.). |
| `createThemeGetters` pattern | Guidance/helper for attaching cached getters that react to nested overrides. |

These utilities live under `src/common` and are exported through the package entry point, so they can be imported from `@4i4/theme-toolkit` as well as via relative paths within the repo.

## Adoption checklist

1. Replace subsystem-specific responsive normalizers with `normalizePropertyValue` / `normalizeResponsiveOverrides`.
2. Standardize CSS variable/class prefixes via the common `css` helpers instead of local sanitizers.
3. Update theme getters (`theme.media`, `theme.typography`, etc.) to use `createDependencyCache` rather than bespoke caching logic.
4. When documenting responsive behavior, reference the responsive contract implemented in `src/common/responsive.ts` to keep docs aligned with code.

Following this checklist ensures every subsystem consumes the same core behaviors, which makes future responsive fixes and docs updates much simpler.

## Utility reference

The sections below outline the intent, expected inputs, and outputs for every shared helper. Treat these as living contracts—when the concrete implementation lands we will replace the placeholders with real code samples and edge-case notes.

### Breakpoint types
- **Helper**: `Breakpoints` / `NormalizedBreakpoints`
- **Purpose**: Provide a canonical `{ [key]: number }` source shape and `{ [key]: { base: number } }` normalized shape for `theme.breakpoints`.
- **Input**: Raw object with monotonic numeric breakpoint values.
- **Output**: Normalized object keyed by the same breakpoint names, safe to cache by reference and feed into media helpers.

### Property normalization
- **Helper**: `normalizePropertyValue` (uses `normalizeResponsiveOverrides`).
- **Purpose**: Convert any `PropertyValue` (primitive or extended object) into `{ base, responsive, variants }` while enforcing architecture rules.
- **Input**: `PropertyValue<TValue, TExtra>` plus optional `PropertyNormalizationOptions` (coercion, fallback, allowed breakpoints).
- **Output**: `NormalizedPropertyValue<TValue, TExtra>` with guaranteed `base`, normalized responsive entries, and normalized variants.
- **Notes**: Responsive entries may include `variant` (which variant to merge) and `target` (whether the breakpoint applies to the base or a specific variant).
- **Example**:
```ts
import { normalizePropertyValue } from "@4i4/theme-toolkit/common";

const rawSpacing = {
  base: "16px",
  variants: {
    tight: "12px",
    relaxed: { base: "20px" },
  },
  responsive: [
    { breakpoint: "md", variant: "relaxed" },
    { breakpoint: "lg", target: "tight", base: "14px" },
  ],
};

const normalized = normalizePropertyValue(rawSpacing, {
  propertyPath: "layout.spacing.md",
  allowedBreakpoints: ["sm", "md", "lg", "xl"],
});

normalized.base; // "16px"
normalized.variants?.relaxed.base; // "20px"
normalized.responsive[0]; // { breakpoint: "md", variant: "relaxed", query: "exact" }
normalized.responsive[1]; // { breakpoint: "lg", target: "tight", base: "14px", query: "exact" }
```

### Responsive override normalization
- **Helper**: `normalizeResponsiveOverrides`.
- **Purpose**: Shared logic for defaulting `query` to `exact`, validating breakpoints, and copying `variant`/`target` metadata.
- **Input**: Raw responsive array and optional context (`propertyPath`, `allowedBreakpoints`, `allowedVariants`, `allowedTargets`).
- **Output**: Array of `NormalizedResponsiveOverride` entries safe for downstream serialization.
- **Validation**: Throws when `breakpoint`, `variant`, or `target` reference values outside the allowed sets.

### Getter caching
- **Helper**: `createDependencyCache`.
- **Purpose**: Wrap expensive getter creation in a WeakMap keyed by the dependency slice (e.g., `theme.breakpoints`).
- **Input**: Dependency object and a factory function.
- **Output**: Cached value reused while the same dependency reference is in scope.
- **Example**:
```ts
import { createDependencyCache } from "@4i4/theme-toolkit/common";
import { media } from "@4i4/theme-toolkit/media";

const mediaCache = createDependencyCache<object, ReturnType<typeof media>>();

export const getThemeMedia = (breakpoints: object, config?: { unit?: string }) =>
  mediaCache.get(breakpoints, () => media(breakpoints as any, config));

// In `createTheme`, define a getter:
Object.defineProperty(theme, "media", {
  get() {
    return getThemeMedia(this.breakpoints, resolvedConfig);
  },
  enumerable: true,
});
```

### Media helpers
- **Helpers**: `resolveMediaConfig`, `mediaQueryString`, `buildMediaDescriptor`.
- **Purpose**: Produce a framework-agnostic descriptor for media queries (sorted breakpoint groups, min/max/between helpers) that can be wrapped by any UI layer (styled-components, vanilla CSS, etc.).
- **Input**: `Breakpoints` map plus optional `MediaConfig` (`unit`, `baseFontSize`).
- **Output**: `MediaDescriptor` containing plain strings/functions (`descriptor.groups[key].min`, `descriptor.min(key)`, `descriptor.between(from, to)`), ready for adapters.
- **Example**:
```ts
import { buildMediaDescriptor, mediaQueryString, resolveMediaConfig } from "@4i4/theme-toolkit/common";
import { wrapMediaDescriptor } from "@4i4/theme-toolkit/media/templates";

const config = resolveMediaConfig({ unit: "rem", baseFontSize: 16 });
const descriptor = buildMediaDescriptor(theme.breakpoints, options =>
  mediaQueryString(options, config),
);
const mediaHelpers = wrapMediaDescriptor(descriptor);

mediaHelpers.groups.md.min`color: blue;`; // styled-components tag
mediaHelpers.between("sm", "lg")`display: none;`;
```

### Token generation contract
- **Helper**: `generateTokens`.
- **Purpose**: Establish a consistent signature for "normalized properties → token maps" so subsystem builders plug into the same pipeline.
- **Input**: `Record<string, TValue>` of normalized entries plus a `buildToken({ name, value })` callback.
- **Output**: Plain object token map (values ready for CSS variable serialization + runtime helpers).
- **Example**:
```ts
import { generateTokens, normalizePropertyValue } from "@4i4/theme-toolkit/common";

const normalizedSpacing = {
  sm: normalizePropertyValue({ base: "8px" }),
  md: normalizePropertyValue({ base: "16px" }),
};

const spacingTokens = generateTokens(normalizedSpacing, ({ name, value }) => ({
  value: value.base,
  responsive: value.responsive,
  cssVariable: `--dt-spacing-${name}`,
}));
```

### CSS variable generation
- **Helper**: `generateCssVariables`.
- **Purpose**: Convert a token map into `{ cssVarName: value }` entries using normalized prefixes.
- **Input**: Token map plus optional options `{ prefix, formatName, mapToken }` to control naming and per-token mappings.
- **Output**: Flat record used by the global renderer and/or subsystem CSS output.
- **Example**:
```ts
import { generateCssVariables } from "@4i4/theme-toolkit/common";

const tokens = {
  md: { value: "16px" },
  lg: { value: "24px", responsive: [{ breakpoint: "lg", value: "32px" }] },
};

const variables = generateCssVariables(tokens, {
  prefix: "spacing",
  mapToken: ({ name, token, prefix, formatName }) => {
    const baseVar = `${prefix}-${formatName(name)}`;
    const map: Record<string, string> = { [baseVar]: token.value };
    token.responsive?.forEach(entry => {
      map[`${baseVar}-${formatName(entry.breakpoint)}`] = entry.value;
    });
    return map;
  },
});
```

### Global CSS variable renderer
- **Helper**: `renderAllCssVariables`.
- **Purpose**: Gather CSS variable maps from every subsystem and emit a single CSS string (e.g., `:root { ... }`).
- **Input**: Array of `{ selector?: string, variables: CssVariableMap }` plus optional options `{ defaultSelector, indent, newline }`.
- **Output**: Deterministic CSS string safe to inject globally or per-scope.
- **Example**:
```ts
import { generateCssVariables, renderAllCssVariables } from "@4i4/theme-toolkit/common";

const paletteVars = generateCssVariables(paletteTokens, { prefix: "palette" });
const spacingVars = generateCssVariables(spacingTokens, { prefix: "spacing" });

const css = renderAllCssVariables([
  { selector: ":root", variables: paletteVars },
  { selector: ":root", variables: spacingVars },
]);

// =>
// :root {
//   --palette-primary: #333;
//   --spacing-md: 16px;
// }
```

### Recipe normalization
- **Helper**: `normalizeRecipeGroup`.
- **Purpose**: Convert raw recipe definitions into normalized `{ base, responsive }` structures with validated breakpoints/variants before subsystem-specific interpretation.
- **Input**: `RecipeGroupDefinition<TProps>` plus optional `{ propertyPath, allowedBreakpoints }`.
- **Output**: `NormalizedRecipeGroup<TProps>` ready for subsystem-specific interpretation.
- **Example**:
```ts
import { normalizeRecipeGroup } from "@4i4/theme-toolkit/common";

const rawRecipes = {
  primary: {
    color: "var(--palette-primary)",
    responsive: [{ breakpoint: "md", color: "var(--palette-contrast)" }],
  },
  secondary: {
    color: "var(--palette-secondary)",
  },
};

const normalized = normalizeRecipeGroup(rawRecipes, {
  propertyPath: "typography.recipes.buttons",
  allowedBreakpoints: ["sm", "md", "lg"],
});

// normalized.primary.base.color === "var(--palette-primary)"
// normalized.primary.responsive[0].query === "exact"
```

### Recipe CSS generation
- **Helper**: `generateRecipeCss`.
- **Purpose**: Shared serializer converting interpreted recipe data into final CSS blocks, including responsive media sections.
- **Input**: Interpreted recipe output (base declaration sets + responsive overrides) and shared rendering context (media helpers, selector builder, optional `formatStyle`).
- **Output**: `{ css, variants }` object (CSS string plus selector map) ready for class assignment.
- **Example**:
```ts
import {
  buildMediaDescriptor,
  mediaQueryString,
  resolveMediaConfig,
  generateRecipeCss,
} from "@4i4/theme-toolkit/common";
import { wrapMediaDescriptor } from "@4i4/theme-toolkit/media/templates";

const config = resolveMediaConfig({ unit: "px" });
const descriptor = buildMediaDescriptor(theme.breakpoints, options =>
  mediaQueryString(options, config),
);
const mediaHelpers = wrapMediaDescriptor(descriptor);

const interpreted = {
  primary: {
    base: { color: "var(--palette-primary)" },
    responsive: [{ breakpoint: "md", query: "min", color: "var(--palette-contrast)" }],
  },
};

const { css, variants } = generateRecipeCss(interpreted, {
  media: mediaHelpers,
  selectorBuilder: variantName => `.btn-${variantName}`,
});
```

### Recipe class assignment
- **Helper**: `assignRecipeClasses`.
- **Purpose**: Produce deterministic class names for recipe outputs, respecting subsystem `cssClassPrefix` and recipe identity.
- **Input**: Selector map `{ variant: selector }` plus optional `{ prefix, hash }`.
- **Output**: Array of `{ variant, selector, className }` entries.
- **Example**:
```ts
import { assignRecipeClasses } from "@4i4/theme-toolkit/common";

const variants = {
  primary: ".btn-primary",
  secondary: ".btn-secondary",
};

const classes = assignRecipeClasses(variants, {
  prefix: "btn",
  hash: selector => selector.length.toString(36),
});

classes[0]; // { variant: "primary", selector: ".btn-primary", className: "btn-primary-...” }
```

### Theme getter pattern
- **Helper**: `defineCachedGetter`.
- **Purpose**: Standardize how we attach cached getters (`theme.media`, `theme.layout.*`, etc.) that react to nested overrides while memoizing by dependency.
- **Input**: Target object, getter key, `getDependency` (e.g., breakpoints) and `createValue` factory; optional `enumerable` flag.
- **Output**: Getter defined via `Object.defineProperty` that reuses cached values until the dependency identity changes.
- **Example**:
```ts
import { defineCachedGetter } from "@4i4/theme-toolkit/common";
import { media } from "@4i4/theme-toolkit/media";

defineCachedGetter(clone, {
  key: "media",
  getDependency: theme => theme.breakpoints,
  createValue: (breakpoints, theme) => media(breakpoints, theme.mediaConfig),
});
```

### CSS prefix + identifier helpers
- **Helpers**: `normalizeCssVariablePrefix`, `normalizeCssClassPrefix`, `sanitizeIdentifierSegment`.
- **Purpose**: Guarantee consistent naming for CSS variables/classes.
- **Input**: Raw prefix/identifier strings.
- **Output**: Sanitized/normalized strings safe for CSS variable/class emission.
- **Example**:
```ts
import {
  normalizeCssVariablePrefix,
  normalizeCssClassPrefix,
  sanitizeIdentifierSegment,
} from "@4i4/theme-toolkit/common";

normalizeCssVariablePrefix("palette"); // "--palette"
normalizeCssClassPrefix("dt buttons"); // "dt-buttons"
sanitizeIdentifierSegment("Primary Variant"); // "primary-variant"
```
