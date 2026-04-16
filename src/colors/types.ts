import type {
  Breakpoints,
  InterpretedRecipeVariant,
  RecipeGroupDefinition,
  PropertyValue,
  NormalizedPropertyValue,
} from "../common";
import type { MediaHelpers } from "../media";

type Colors = "main" | "dark" | "darker" | "light" | "lighter" | "text";
type ColorSet = Partial<Record<Colors, string>>;
export interface RequiredColorSet extends ColorSet {
  main: string;
  text: string;
}

export type PaletteVariantMap = Record<string, string>;

export type PalettePropertyExtras = {
  text: string;
  steps?: Array<string | number>;
  lightenBy?: number;
  darkenBy?: number;
  algorithm?: (base: string, step: string) => string;
};

export type PalettePropertyValue = PropertyValue<string, PalettePropertyExtras>;

export type NormalizedPaletteValue = NormalizedPropertyValue<string, PalettePropertyExtras>;

export type PaletteSource = PalettePropertyValue;

export interface PaletteTokens {
  text: string;
  variants: PaletteVariantMap;
}

export interface PaletteBuilderOptions {
  prefix?: string;
  classPrefix?: string;
}

export type PaletteCollection<TKey extends string> = Record<TKey, PalettePropertyValue>;

export type NormalizedPaletteCollection<TKey extends string> = Record<
  TKey,
  NormalizedPaletteValue
>;

export type PaletteRecipeValue = string | number;

export type PaletteRecipeProps = {
  background?: PaletteRecipeValue;
  backgroundColor?: PaletteRecipeValue;
  color?: PaletteRecipeValue;
  borderColor?: PaletteRecipeValue;
  outlineColor?: PaletteRecipeValue;
  [property: string]: PaletteRecipeValue | undefined;
};

export type PaletteRecipeGroup<TBreakpoint extends string> = RecipeGroupDefinition<
  PaletteRecipeProps,
  TBreakpoint
>;

export type PaletteRecipeSource<TBreakpoint extends string> = Record<
  string,
  PaletteRecipeGroup<TBreakpoint>
>;

export type PaletteRecipeVariantStyles<TBreakpoint extends string> = InterpretedRecipeVariant<TBreakpoint>;

export type PaletteRecipeStyleMap<TBreakpoint extends string> = Record<
  string,
  PaletteRecipeVariantStyles<TBreakpoint>
>;

export type PaletteRecipeRegistry<TBreakpoint extends string> = {
  css: string;
  selectors: Record<string, Record<string, string>>;
  classes: Record<string, Record<string, string>>;
  styles: Record<string, PaletteRecipeStyleMap<TBreakpoint>>;
};

export type PaletteRecipeBuildOptions<TBreakpoint extends string> = {
  breakpoints: Breakpoints<TBreakpoint>;
  media: MediaHelpers<TBreakpoint>;
  classPrefix?: string;
};
