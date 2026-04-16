# Subsystem Pipeline Flow Example

This illustrates how a single subsystem plugs into `createTheme` while following the "shared reducer → subsystem hook" steps for normalization, tokenization, CSS variables, and recipes.

## 1. Subsystem files

```
colors/
  index.ts         // re-exports public API
  types.ts         // raw + normalized types
  utils.ts         // local helpers (hex ↔ rgb, etc.)
  tokens.ts        // token mapping + CSS variable generator
  recipes.ts       // recipe interpretation + recipe CSS
  theme.ts         // theme adapter (exposed to createTheme)
```

## 2. Normalization reducer pattern

```ts
// colors/normalize.ts (conceptual)
export const normalizePalette = (
  name: string,
  raw: PaletteProperty,
  normalized: NormalizedPropertyValue<string>,
) => {
  const next = { ...normalized };

  // Subsystem post-processing: inject defaults / enforce rules
  if (!next.variants?.light) {
    next.variants = {
      ...next.variants,
      light: { base: lighten(next.base, 20) },
    };
  }

  return next;
};
```

`createTheme` runs the shared `normalizePropertyValue` first, then calls this hook so the subsystem mutates/extends the normalized state without re-running the base reducer.

## 3. Tokenization step

```ts
// colors/tokens.ts
export const tokenizePaletteProperty = (name, normalized, baseToken) => {
  const variants = buildVariantMap(normalized);
  return {
    ...baseToken,
    text: normalized.text,
    variants,
  };
};
```

`createTheme` runs the shared tokenization first, then calls `tokenizePaletteProperty` (if exported) so the subsystem can extend the token with palette-specific data.

```ts
// colors/theme.ts
export const createPaletteThemeHelper = () => ({
  ...,
  tokenizeProperty: tokenizePaletteProperty,
});

// theme/index.ts (conceptual snippet)
const tokens = generateTokens(normalizedPalette, context => {
  const baseToken = { text: context.value.text, variants: {} };
  return paletteHelper.tokenizeProperty
    ? paletteHelper.tokenizeProperty(context.name, context.value, baseToken)
    : baseToken;
});

const paletteSlice = {
  paletteTokens: tokens,
  paletteCSS: renderAllCssVariables([
    {
      selector: ":root",
      variables: generateCssVariables(tokens, { prefix: normalizeCssVariablePrefix(options?.palette?.prefix) }),
    },
  ]),
};
```

Here `generateTokens` is the shared stage; the subsystem supplies an optional token reducer to augment the shared result. CSS variables are rendered directly from the final tokens using shared helpers, with the subsystem contributing only its prefix preference.

## 4. Recipe flow

```ts
// colors/recipes.ts
export const buildPaletteRecipes = (source, tokens, ctx) => {
  const normalized = normalizeRecipeGroup(source, {
    propertyPath: "palette.recipes",
    allowedBreakpoints: Object.keys(ctx.breakpoints),
  });

  const interpreted = interpretPaletteRecipes(normalized, tokens); // subsystem hook

  return generateRecipeCss(interpreted, {
    media: ctx.media,
    selectorBuilder: variant => `.dt-color-${variant}`,
  });
};
```

Again, shared normalization first, subsystem interpretation second, shared CSS renderer last.

## 5. Subsystem helper & `createTheme` integration

```ts
// colors/theme.ts
export const createPaletteThemeHelper = () => ({
  key: "palette",
  normalizeProperty: (name, raw, normalized) => normalizePalette(name, raw, normalized),
  buildHelpers: (normalizedSource, options) => buildPaletteHelpers(normalizedSource, options),
  buildRecipes: (source, tokens, ctx) => buildPaletteRecipes(source, tokens, ctx),
});

// theme/index.ts (excerpt)
const paletteHelper = createPaletteThemeHelper();

const normalizedPalette = Object.fromEntries(
  Object.entries(theme.palette ?? {}).map(([name, raw]) => {
    const base = normalizePropertyValue(raw, sharedOptions);
    const extended = paletteHelper.normalizeProperty
      ? paletteHelper.normalizeProperty(name, raw, base)
      : base;
    return [name, extended];
  }),
);

const paletteSlice = paletteHelper.buildHelpers(normalizedPalette, options?.palette);
let cachedRecipes = paletteHelper.buildRecipes?.(
  theme.paletteRecipes,
  paletteSlice.paletteTokens,
  sharedCtx,
);
```

`createTheme` calls each subsystem helper, runs shared normalization first, and invokes optional hooks (like `normalizeProperty`) when present. Adding another subsystem simply reuses this helper contract, keeping the normalization → tokens → CSS → recipes steps consistent across the board.
