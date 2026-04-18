import type {
  PropertyValue,
  RecipeGroupDefinition,
} from "../../core/common";

// --- Properties ---

export type RadiusValue = PropertyValue<number | string>;
export type ShadowValue = PropertyValue<string>;
export type BlurValue = PropertyValue<number | string>;
export type ZIndexValue = PropertyValue<number>;
export type OpacityValue = PropertyValue<number>;
export type OutlineValue = PropertyValue<string>;
export type BorderWidthValue = PropertyValue<number>;
export type TransitionValue = PropertyValue<string>;

// --- Recipes ---

export type EffectsRecipeProps = {
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;
  outline?: string;
  borderWidth?: string;
  blur?: string;
  transition?: string;
  zIndex?: string;
  [property: string]: string | undefined;
};

export type EffectsRecipeSource<TBreakpoint extends string = string> = Record<
  string,
  RecipeGroupDefinition<EffectsRecipeProps, TBreakpoint>
>;

// --- Source ---

export type EffectsSource = {
  radius?: RadiusValue;
  shadow?: ShadowValue;
  blur?: BlurValue;
  zIndex?: ZIndexValue;
  opacity?: OpacityValue;
  outline?: OutlineValue;
  borderWidth?: BorderWidthValue;
  transitions?: TransitionValue;
  recipes?: EffectsRecipeSource;
};

// --- Tokens ---

export type EffectsPropertyTokens = {
  base: string | number;
  variants: Record<string, string | number>;
};

export type EffectsTokens = Record<string, EffectsPropertyTokens>;

// --- Options ---

export type EffectsBuilderOptions = {
  prefix?: string;
  classPrefix?: string;
};
