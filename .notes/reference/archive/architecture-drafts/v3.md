# Theme Architecture for Codex

## Goal

Build a theme system where:

- each subsystem owns its own top-level theme namespace, for example:
  - `theme.layout`
  - `theme.typography`
  - `theme.media`
- all subsystems share a common infrastructure for:
  - base property normalization
  - token generation
  - CSS variable generation
  - recipe CSS generation
  - CSS class generation and assignment
- each subsystem can extend the shared behavior with subsystem-specific rules
- all theme-bound utilities are exposed as getters so they always work with the current theme state, including nested overrides
- global `breakpoints` are defined at `theme.breakpoints` and used by most responsive logic
- getters may use internal caching, but the cache must be scoped to the relevant current theme data

---

## High-level model

The system has two main engines:

1. **Property engine**
   - receives raw property definitions
   - normalizes them
   - generates tokens
   - generates CSS variables from tokens

2. **Recipe engine**
   - receives raw recipe definitions
   - lets the subsystem interpret recipe properties
   - generates ready-to-use CSS
   - generates and assigns CSS classes for that CSS

In addition, there is a **global CSS variable renderer** that collects CSS variables from all subsystems and renders them in one place.

---

## Global theme structure

The raw theme passed to `createTheme` contains:

- global `breakpoints`
- subsystem definitions

Example shape:

```ts
type RawTheme = {
  breakpoints?: BreakpointsDefinition;
  layout?: LayoutSubsystemSource;
  typography?: TypographySubsystemSource;
  media?: MediaSubsystemSource;
  // additional subsystems
};
```

The created runtime theme contains:

- global normalized `breakpoints`
- normalized subsystem outputs
- subsystem getters
- shared getters
- rendered tokens / variables / classes / recipe CSS as needed

Example conceptual runtime shape:

```ts
type Theme = {
  breakpoints: NormalizedBreakpoints;

  layout: LayoutThemeSlice;
  typography: TypographyThemeSlice;
  media: MediaThemeSlice;

  // theme-bound shared or subsystem-specific getters
  mediaQuery: MediaQueryUtility;
  // or getter-based utilities on subsystem slices
};
```

Important rule:

- anything that depends on current theme state must be exposed through the theme as a getter
- anything that does not need theme context should be imported directly and not attached to the theme

---

## createTheme

`createTheme` receives two arguments:

1. raw theme source
2. subsystem options

Example conceptual signature:

```ts
function createTheme(
  rawTheme: RawTheme,
  options?: CreateThemeOptions
): Theme
```

The second argument contains subsystem options such as:

- default units, for example `px`
- subsystem-specific overrides
- CSS variable prefix configuration
- CSS class prefix configuration
- other normalization or output options

Example:

```ts
type CreateThemeOptions = {
  layout?: {
    unit?: string;
    cssVariablePrefix?: string;
    cssClassPrefix?: string;
  };
  typography?: {
    unit?: string;
    cssVariablePrefix?: string;
    cssClassPrefix?: string;
  };
  media?: {
    unit?: string;
    cssVariablePrefix?: string;
    cssClassPrefix?: string;
  };
};
```

Rules for `cssVariablePrefix`:

- each subsystem may provide its own CSS variable prefix
- if no prefix is provided, use `dt` (design tokens)
- the prefix may be provided as:
  - `some-prefix`
  - `--some-prefix`
- the system must normalize it so the stored usable prefix always starts with `--`

Examples:

- `dt` -> `--dt`
- `--dt` -> `--dt`
- `theme` -> `--theme`

Rules for `cssClassPrefix`:

- each subsystem may provide its own CSS class prefix
- this prefix is used when generating classes for recipe CSS
- if a class prefix normalization rule is needed, it should be applied centrally in the shared utility layer

---

## Global breakpoints

There is one global `breakpoints` definition in the theme.

It is shared and used by most subsystems, especially:

- responsive property rules
- responsive recipe rules
- media query utilities

Example source:

```ts
type BreakpointsDefinition = {
  [key: string]: number;
};
```

Normalized example:

```ts
type NormalizedBreakpoints = {
  [key: string]: {
    base: number;
  };
};
```

Breakpoints are a global source of truth.

Responsive rules must reference breakpoint keys defined in `theme.breakpoints`.

Example:

- if `theme.breakpoints` is:
  - `{ xs: 0, sm: 768, md: 1024, lg: 1280 }`
- then a responsive rule may use:
  - `breakpoint: "md"`
- and must not use an arbitrary string not present in the breakpoint definition

This should be enforced in two ways:

1. type-level constraint where possible
2. runtime validation during normalization or recipe processing

If breakpoints change in an overridden theme slice, all getter-based utilities that depend on them, such as media query helpers, must automatically use the new definition.

---

## Base property model

Most properties can be defined in two forms:

1. primitive value
2. extended object

Examples:

- `fontFamily` can be:
  - `string`
  - extended object
- `fontWeight` can be:
  - `number`
  - extended object

So the reusable property pattern is:

```ts
type PropertyValue<TValue extends string | number, TExtended> =
  | TValue
  | TExtended;
```

---

## Canonical normalized property shape

Every property is normalized to an object with `base`.

Examples:

Source:

```ts
fontFamily: "Arial"
fontWeight: 700
```

Normalized:

```ts
fontFamily: { base: "Arial" }
fontWeight: { base: 700 }
```

Extended objects must also use `base`.

Examples:

```ts
fontFamily: { base: "Arial" }
fontWeight: { base: 700 }
```

Canonical normalized contract:

```ts
type NormalizedProperty<TValue extends string | number, TExtra = {}> = {
  base: TValue;
} & TExtra;
```

---

## Shared special property: variants

Every extended property may support a shared special field named `variants`.

Example:

```ts
fontFamily: {
  base: "Arial",
  variants: {
    mono: "Courier New",
    brand: {
      base: "Inter",
      fallback: ["Arial", "sans-serif"]
    }
  }
}
```

Rules:

- `variants` is supported on the root extended property
- each variant can be:
  - primitive value
  - extended value
- variant values must not support nested `variants`
- variant values must not support their own `responsive`
- variants may partially or fully override the base property
- responsive behavior is defined only in the main `responsive` property on the root extended property
- responsive rules may target the base property or a specific variant by using the `target` field

Conceptually:

```ts
type VariantValue<TValue extends string | number, TExtra = {}> =
  | TValue
  | ({
      base: TValue;
    } & TExtra);
```

Root property:

```ts
type ExtendedProperty<TValue extends string | number, TExtra = {}> = {
  base: TValue;
  variants?: Record<string, VariantValue<TValue, TExtra>>;
  responsive?: ResponsiveRule<TValue, TExtra>[];
} & TExtra;
```

---

## Shared special property: responsive

Responsive is supported on:

- extended base properties
- recipes

Responsive is not defined inside variants.
Instead, the main `responsive` property may target a specific variant.

Example:

```ts
fontWeight: {
  base: 700,
  variants: {
    light: {
      base: 300
    }
  },
  responsive: [
    {
      breakpoint: "lg",
      target: "light",
      base: 400
    }
  ]
}
```

Rules:

- `breakpoint` is required
- `query` is optional
- supported values:
  - `"min"`
  - `"max"`
  - `"exact"`
- default query is `"exact"`
- `target` is optional
- if `target` is omitted, the responsive rule applies to the root base property flow
- if `target` is provided, it must reference a defined variant name
- a responsive entry may:
  - target a specific variant by name
  - partially override the targeted value
  - fully override the targeted value

Conceptual shape:

```ts
type ResponsiveQuery = "min" | "max" | "exact";

type ResponsiveRule<TValue extends string | number, TExtra = {}> = {
  breakpoint: string;
  query?: ResponsiveQuery;
  target?: string;
} & Partial<{
  base: TValue;
} & TExtra>;
```

Important constraint:

- the `breakpoint` value is a breakpoint key, not an arbitrary string
- it must correspond to one of the keys defined in `theme.breakpoints`
- example: with `theme.breakpoints = { xs: 0, sm: 768, md: 1024 }`, valid values include `"xs"`, `"sm"`, and `"md"`
- if `target` is provided, it must correspond to one of the keys defined in the property `variants` map

Important design note:

The merge and precedence behavior must be explicitly defined and kept consistent everywhere.

Recommended conceptual precedence:

1. start from root `base`
2. if a variant is selected, merge that variant on top of base
3. if a responsive rule applies with no `target`, merge it on top of the root base flow
4. if a responsive rule applies with a `target`, resolve the targeted variant flow first, then merge the responsive rule on top of that targeted flow

This precedence model should be reused across all subsystems.

---

## Base properties vs recipes

These are different concerns.

### Base properties

Base properties are:

- normalized
- tokenized
- converted into CSS variables

Examples:
- colors
- font families
- font weights
- spacing values
- radii
- sizing primitives

### Recipes

Recipes are:

- ready-to-use style definitions
- interpreted by the subsystem
- turned into generated CSS
- assigned generated CSS classes

Recipes do not primarily exist to create tokens.
Recipes exist to create composed CSS output.

---

## Recipes

All subsystems may define recipes on two levels:

1. group level
2. variant level

Each variant is also a recipe.

Each subsystem defines the properties allowed in its recipes.

Recipes also support `responsive`.

Conceptual recipe source example:

```ts
type RecipeSource<TRecipeProps> = TRecipeProps & {
  responsive?: RecipeResponsiveRule<TRecipeProps>[];
  variants?: Record<string, TRecipeProps>;
};
```

Responsive for recipes:

```ts
type RecipeResponsiveRule<TRecipeProps> = {
  breakpoint: string;
  query?: ResponsiveQuery;
  target?: string;
} & Partial<TRecipeProps>;
```

Important constraints:

- the `breakpoint` value must correspond to one of the keys defined in `theme.breakpoints`
- if `target` is provided, it must correspond to one of the keys defined in the recipe `variants` map

Rules:

- recipe properties are interpreted by the subsystem
- responsive behavior is handled by shared infrastructure plus subsystem interpretation
- recipe variants are recipes
- recipe variant merging rules should follow the same conceptual inheritance model as base properties

---

## Shared utilities

### 1. Property normalization utility

Shared responsibility:

- convert primitive values to `{ base: value }`
- normalize the shared `variants` field
- normalize the shared `responsive` field
- ensure canonical structure for all base properties

Subsystem responsibility:

- normalize additional subsystem-specific fields in the extended property

Conceptual contract:

```ts
normalizeProperty(raw, options, context) => normalizedProperty
```

---

### 2. Token generation utility

Shared responsibility:

- generate tokens from normalized base properties

Subsystem responsibility:

- define which normalized base properties become tokens
- provide token naming or mapping rules if necessary

Conceptual contract:

```ts
generateTokens(normalizedSubsystemProperties, options, context) => tokens
```

---

### 3. CSS variable generation utility

Shared responsibility:

- create CSS variables from tokens
- use the subsystem CSS variable prefix from `createTheme` options
- normalize the prefix so it always starts with `--`
- fall back to `--dt` when no subsystem prefix is provided

Conceptual contract:

```ts
generateCssVariables(tokens, options, context) => cssVariableMap
```

Example output:

```ts
{
  "--dt-typography-font-family-base": "Arial",
  "--dt-typography-font-weight-bold": "700"
}
```

---

### 4. Global CSS variable renderer

Shared global responsibility:

- collect CSS variables from all subsystems
- render them into a single CSS output

Conceptual contract:

```ts
renderAllCssVariables(allSubsystemCssVariableMaps, options, context) => string
```

Typical output target:
- `:root`
- or a scoped selector if needed

Example:

```css
:root {
  --typography-font-family-base: Arial;
  --typography-font-weight-bold: 700;
  --layout-space-md: 16px;
}
```

---

### 5. Recipe CSS generation utility

Shared responsibility:

- take normalized or interpreted recipe output
- generate final CSS blocks
- handle shared recipe-level responsive expansion

Subsystem responsibility:

- interpret subsystem-specific recipe properties into a normalized CSS-like structure

Recommended boundary:

- subsystem does **not** generate final CSS strings directly
- subsystem returns a normalized style instruction structure
- shared utility serializes that structure into final CSS

Conceptual contract:

```ts
interpretRecipe(recipe, subsystemContext) => interpretedRecipe
generateRecipeCss(interpretedRecipe, sharedContext) => cssOutput
```

---

### 6. CSS class generation and assignment utility

Shared responsibility:

- generate CSS classes for the CSS produced from recipes
- assign class names to generated recipe outputs
- optionally keep a mapping registry
- use the subsystem CSS class prefix from `createTheme` options when generating class names

Conceptual contract:

```ts
assignRecipeClasses(generatedCss, options, context) => {
  classes,
  css,
  registry
}
```

Recommendation:

Use deterministic class naming, ideally based on:
- subsystem CSS class prefix
- recipe path
- recipe name
- optional hashing for collision safety

This makes debugging and SSR easier.

Avoid purely sequential random names unless there is a very strong reason.

---

## Subsystem responsibilities

Each subsystem defines:

1. its top-level theme namespace
2. its source schema
3. its extended property extra fields
4. how those extra fields are normalized
5. which base properties become tokens
6. its recipe property schema
7. how recipe properties are interpreted into a CSS-like structure
8. its theme-bound getters

Example subsystem ownership:

- `theme.layout`
- `theme.typography`
- `theme.media`

Important principle:

Shared infrastructure handles the common mechanics.
The subsystem decides how to interpret its own domain-specific data.

---

## Theme-bound getters

All utilities that depend on theme state must be introduced as getters.

Reason:

- they depend on current theme values
- nested theme overrides should automatically affect them
- they should always use the current theme slice or global properties

Example:

- a media subsystem introduces a `media` getter
- if `breakpoints` are overridden in a nested theme
- `theme.media` should use the new breakpoints automatically

Conceptual example:

```ts
Object.defineProperty(theme, "media", {
  get() {
    return getOrCreateMediaUtility(theme.breakpoints);
  }
});
```

The same principle applies to any utility that depends on:
- global breakpoints
- subsystem definitions
- normalized outputs
- options tied to the current theme

Rule:

- if the utility needs theme context, expose it through the theme as a getter
- if the utility does not need theme context, export it as a normal import

---

## Getter caching

Getters may include caching.

This is recommended because:

- utilities should stay dynamic
- but expensive work should not rerun on every property access

Cache rule:

- cache by the smallest relevant dependency object
- do not cache against the whole world if only one slice matters

Examples:

- `theme.media` depends on `theme.breakpoints`
- cache by `theme.breakpoints`
- `theme.layout.someUtility` may depend only on `theme.layout`
- cache by `theme.layout`

Recommended implementation pattern:

- `WeakMap` cache keyed by the relevant object identity

Example concept:

```ts
const mediaCache = new WeakMap<object, MediaUtility>();

function getOrCreateMediaUtility(breakpoints: object): MediaUtility {
  const cached = mediaCache.get(breakpoints);
  if (cached) {
    return cached;
  }

  const next = createMediaUtility(breakpoints);
  mediaCache.set(breakpoints, next);
  return next;
}
```

This gives the desired behavior:

- same current breakpoint object -> same cached utility
- overridden breakpoint object -> new utility automatically

Avoid:

- heavy recomputation on every getter call
- global permanent caches unrelated to actual dependencies
- JSON-stringification-based caching unless truly necessary

---

## Recommended internal pipeline

### Property engine

```txt
raw property
-> shared normalization
-> subsystem-specific extra normalization
-> normalized property
-> token generation
-> CSS variable generation
```

### Recipe engine

```txt
raw recipe
-> subsystem-specific recipe interpretation
-> shared responsive expansion / CSS generation
-> CSS class generation / assignment
```

### Global CSS variables

```txt
all subsystem CSS variable maps
-> global CSS variable renderer
-> single final CSS variables output
```

---

## Recommended contract boundaries

### Property normalization contract

Input:
- primitive or extended property

Output:
- fully normalized property object with canonical `base`
- normalized `variants`
- normalized `responsive`
- normalized subsystem-specific extra fields

---

### Recipe interpretation contract

Input:
- subsystem recipe source

Output:
- normalized CSS-like instruction structure

Shared engine then:
- applies responsive expansion
- serializes CSS
- assigns classes

---

### Getter contract

Input:
- current theme state

Output:
- utility bound to the current theme data

Requirements:
- must react to nested overrides
- may use caching
- should avoid heavy recomputation
- should be deterministic

---

## Important consistency rules

These rules should be documented and reused across all subsystems.

### 1. Base normalization rule

Primitive source:

```ts
fontFamily: "Arial"
```

becomes:

```ts
fontFamily: { base: "Arial" }
```

### 2. Extended object rule

Extended objects must include `base`.

### 3. Variant rule

- variants exist only one level deep
- variants cannot contain nested `variants`
- variants cannot contain `responsive`
- responsive targeting for variants is handled from the root `responsive` array through `target`

### 4. Responsive rule

Responsive is supported on:
- root extended properties
- recipes

Responsive `breakpoint` values must match keys from `theme.breakpoints`.

When responsive behavior needs to affect a variant, it must do so through the root-level `target` field, not through nested variant `responsive` definitions.

### 5. Merge rule

Recommended consistent inheritance order:

```txt
base
-> selected variant
-> responsive referenced variant
-> responsive inline overrides
```

This order must be explicitly implemented and documented.

### 6. Getter rule

Any utility that depends on theme state must be accessed through the theme as a getter.

---

## Suggested architecture summary

### Shared core

The shared core should provide:

- property normalization utility
- token generation utility
- CSS variable generation utility
- CSS variable prefix normalization utility
- global CSS variable renderer
- recipe CSS generation utility
- CSS class generation / assignment utility
- CSS class prefix support
- getter caching helpers
- breakpoint / media shared support

### Per subsystem

Each subsystem should provide:

- raw source schema
- extended property extra fields
- extra normalization rules
- token mapping rules
- recipe schema
- recipe interpretation logic
- theme getters

### Global theme creation

`createTheme` should:

- normalize global breakpoints
- build each subsystem
- attach subsystem slices
- attach getter-based utilities
- prepare all CSS variables
- prepare recipe CSS outputs and class mappings as needed

---

## Final design intent

This architecture is designed so that:

- all shared behavior is centralized
- subsystem-specific behavior stays flexible
- the runtime theme remains dynamic
- nested overrides naturally work
- tokens and CSS variables stay separate from recipes and generated CSS
- subsystem CSS variable prefixes and CSS class prefixes are configurable through `createTheme` options
- CSS variable prefixes are normalized so they always start with `--`
- global breakpoints are numeric and act as the source of truth for all responsive behavior
- responsive rules may target variants through a root-level `target` field
- theme-bound utilities adapt automatically to the current theme state
- performance is controlled through dependency-scoped getter caching

