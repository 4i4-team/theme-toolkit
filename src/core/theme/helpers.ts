import type {
  CssVariablesNode,
  InterpretedRecipeVariant,
  NormalizedPropertyValue,
  NormalizedRecipeGroup,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
  ResolveCssVariableName,
} from "../common";

// -----------------------------------------------------------------------------
// Property pipeline hooks
// -----------------------------------------------------------------------------

export type NormalizePropertyHook<TRaw, TValue> = (
  name: string,
  raw: TRaw,
  normalized: NormalizedPropertyValue<TValue>,
) => NormalizedPropertyValue<TValue>;

export type TokenizePropertyHook<TValue, TToken> = (
  name: string,
  normalized: NormalizedPropertyValue<TValue>,
  baseToken: TToken,
) => TToken;

export type MapCssVariablesHook<TTokens> = (
  tokens: TTokens,
  prefix: string,
) => Record<string, string>;

export type TransformResponsiveCssHook<TBreakpoint extends string> = (
  nodes: CssVariablesNode[],
  context: {
    tokens: unknown;
    breakpoints: Record<TBreakpoint, number>;
  },
) => CssVariablesNode[];

// -----------------------------------------------------------------------------
// Recipe pipeline hooks
// -----------------------------------------------------------------------------

export type NormalizeRecipeHook<
  TRecipeProps extends Record<string, unknown>,
  TBreakpoint extends string,
> = (
  group: NormalizedRecipeGroup<TRecipeProps, TBreakpoint>,
) => NormalizedRecipeGroup<TRecipeProps, TBreakpoint>;

export type RecipeInterpretContext<TBreakpoint extends string> = {
  tokens: unknown;
  breakpoints: Record<TBreakpoint, number>;
  resolveCssVariable: ResolveCssVariableName;
  resolveRecipeVariant: (variantName: string) => InterpretedRecipeVariant<TBreakpoint>;
  options?: unknown;
};

export type InterpretRecipeFn<
  TRecipeProps extends Record<string, unknown>,
  TBreakpoint extends string,
> = (
  variantName: string,
  variant: NormalizedRecipeVariant<TRecipeProps, TBreakpoint>,
  context: RecipeInterpretContext<TBreakpoint>,
) => InterpretedRecipeVariant<TBreakpoint>;

export type MapRecipeCssHook = (
  css: string,
  context: {
    classes: Record<string, Record<string, string>>;
    selectors: Record<string, Record<string, string>>;
  },
) => string;

// -----------------------------------------------------------------------------
// Slice builders
// -----------------------------------------------------------------------------

export type RecipeStyles<TBreakpoint extends string, TRecipeStyle extends RecipeStyleBlock> = Record<
  string,
  Record<string, { base: TRecipeStyle; responsive: RecipeResponsiveOverride<TRecipeStyle, TBreakpoint>[] }>
>;

export type RecipeOutputs<TBreakpoint extends string, TRecipeStyle extends RecipeStyleBlock> = {
  css: string;
  selectors: Record<string, Record<string, string>>;
  classes: Record<string, Record<string, string>>;
  styles: RecipeStyles<TBreakpoint, TRecipeStyle>;
};

export type SubsystemSliceContext = {
  source?: unknown;
  tokens: unknown;
  css: string;
  recipes?: unknown;
  options?: unknown;
};

export type BuildSliceFn<TExtras = Record<string, unknown>> = (
  context: SubsystemSliceContext,
) => TExtras;

export type BuildGlobalsFn = (
  context: SubsystemSliceContext & { slice: unknown },
) => Record<string, unknown>;

// -----------------------------------------------------------------------------
// Legacy (to be retired by the createTheme refactor)
// -----------------------------------------------------------------------------

export type BuildHelpersFn<TRaw, TOptions, TSlice> = (
  source: TRaw,
  options?: TOptions,
) => TSlice;

export type BuildRecipesFn<
  TRecipes,
  TTokens,
  TBreakpoint extends string,
  TRecipeStyle extends RecipeStyleBlock,
  TOptions,
> = (
  recipes: TRecipes | undefined,
  tokens: TTokens,
  context: {
    breakpoints: Record<TBreakpoint, number>;
    media: unknown;
    options?: TOptions;
  },
) => RecipeOutputs<TBreakpoint, TRecipeStyle>;

// -----------------------------------------------------------------------------
// Subsystem helper contract
// -----------------------------------------------------------------------------

export type CreateThemeHelperArgs<
  TSubsystemKey extends string,
  TRawSource,
  TValue,
  TToken,
  TOptions,
  TSlice,
  TRecipes,
  TTokens,
  TBreakpoint extends string,
  TRecipeStyle extends RecipeStyleBlock,
  TRecipeProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  key: TSubsystemKey;

  // Property pipeline
  normalizeProperty?: NormalizePropertyHook<TRawSource, TValue>;
  tokenizeProperty?: TokenizePropertyHook<TValue, TToken>;
  mapCssVariables?: MapCssVariablesHook<TTokens>;
  transformResponsiveCss?: TransformResponsiveCssHook<TBreakpoint>;

  // Recipe pipeline
  normalizeRecipe?: NormalizeRecipeHook<TRecipeProps, TBreakpoint>;
  interpretRecipe?: InterpretRecipeFn<TRecipeProps, TBreakpoint>;
  mapRecipeCss?: MapRecipeCssHook;

  // Slice builders
  buildHelpers: BuildHelpersFn<TRawSource, TOptions, TSlice>;
  buildSlice?: BuildSliceFn;
  buildGlobals?: BuildGlobalsFn;

  // Dependency ordering (composition subsystems declare here)
  dependsOn?: readonly string[];

  // Legacy monolithic recipe builder; the createTheme refactor retires this
  // in favour of the interpretRecipe + shared CSS/class stages.
  buildRecipes?: BuildRecipesFn<TRecipes, TTokens, TBreakpoint, TRecipeStyle, TOptions>;
};

export type SubsystemThemeHelper = CreateThemeHelperArgs<
  string,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  string,
  RecipeStyleBlock
>;
