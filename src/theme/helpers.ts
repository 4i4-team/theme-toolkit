import type {
  NormalizedPropertyValue,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../common";

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

export type BuildHelpersFn<TRaw, TOptions, TSlice> = (
  source: TRaw,
  options?: TOptions,
) => TSlice;

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
> = {
  key: TSubsystemKey;
  normalizeProperty?: NormalizePropertyHook<TRawSource, TValue>;
  tokenizeProperty?: TokenizePropertyHook<TValue, TToken>;
  mapCssVariables?: MapCssVariablesHook<TTokens>;
  buildHelpers: BuildHelpersFn<TRawSource, TOptions, TSlice>;
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
