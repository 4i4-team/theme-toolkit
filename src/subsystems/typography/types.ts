import type {
  PropertyValue,
  NormalizedPropertyValue,
  RecipeGroupDefinition,
} from "../../core/common";

// --- Scale configuration for fontSize ---

export type TypographyScaleKey =
  | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export type TypographyRatioKey =
  | "minor-second" | "major-second" | "minor-third" | "major-third"
  | "perfect-fourth" | "augmented-fourth" | "perfect-fifth" | "golden";

export type FontSizeExtras = {
  ratio?: TypographyRatioKey;
  precision?: number;
  unit?: "px" | "rem";
  baseFontSize?: number;
  algorithm?: (base: number, key: string, step: number, prev: number | null) => number;
};

// --- Property value types ---

export type FontFamilyValue = PropertyValue<string>;
export type FontSizeValue = PropertyValue<number, FontSizeExtras>;
export type FontWeightValue = PropertyValue<number>;
export type LineHeightValue = PropertyValue<number>;
export type LetterSpacingValue = PropertyValue<string>;
export type FontStyleValue = PropertyValue<string>;
export type TextTransformValue = PropertyValue<string>;
export type TextDecorationValue = PropertyValue<string>;
export type TextAlignValue = PropertyValue<string>;

// --- Recipe types ---

export type TypographyRecipeProps = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontStyle?: string;
  textTransform?: string;
  textDecoration?: string;
  textAlign?: string;
  [property: string]: string | undefined;
};

export type TypographyRecipeSource<TBreakpoint extends string = string> = Record<
  string,
  RecipeGroupDefinition<TypographyRecipeProps, TBreakpoint>
>;

// --- Source (raw input) ---

export type TypographySource = {
  fontFamily?: FontFamilyValue;
  fontSize?: FontSizeValue;
  fontWeight?: FontWeightValue;
  lineHeight?: LineHeightValue;
  letterSpacing?: LetterSpacingValue;
  fontStyle?: FontStyleValue;
  textTransform?: TextTransformValue;
  textDecoration?: TextDecorationValue;
  textAlign?: TextAlignValue;
  recipes?: TypographyRecipeSource;
};

// --- Token shape ---

export type TypographyPropertyTokens = {
  base: string | number;
  variants: Record<string, string | number>;
};

export type TypographyTokens = Record<string, TypographyPropertyTokens>;

// --- Options ---

export type TypographyBuilderOptions = {
  unit?: "px" | "rem";
  prefix?: string;
};
