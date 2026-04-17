export type TypographyScaleKey =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl";

export type TypographyScaleSteps = Record<TypographyScaleKey, number>;

export type TypographyFamilyKey = "base" | "heading" | "mono";

export type TypographyWeightKey = "regular" | "medium" | "semibold" | "bold";

export type TypographyLineHeightKey = "tight" | "normal" | "relaxed";

export type TypographyLetterSpacingKey = "tighter" | "normal" | "wide";

export type TypographyStyleDefinition = {
  family: TypographyFamilyKey;
  size: TypographyScaleKey;
  weight: TypographyWeightKey;
  lineHeight: TypographyLineHeightKey;
  letterSpacing: TypographyLetterSpacingKey;
  responsive?: Array<{
    breakpoint: string;
    size?: TypographyScaleKey;
    weight?: TypographyWeightKey;
    lineHeight?: TypographyLineHeightKey;
    letterSpacing?: TypographyLetterSpacingKey;
    query?: "min" | "max" | "exact";
  }>;
};

export type TypographyStyles = Record<string, Record<string, TypographyStyleDefinition>>;

export type TypographyScaleUnit = "px" | "rem";

export type TypographyRatioKey =
  | "minor-second"
  | "major-second"
  | "minor-third"
  | "major-third"
  | "perfect-fourth"
  | "augmented-fourth"
  | "perfect-fifth"
  | "golden";

export type TypographyScaleConfig = {
  baseFontSize: number;
  ratio: TypographyRatioKey;
  steps?: Partial<TypographyScaleSteps>;
  variants?: Partial<Record<TypographyScaleKey, number>>;
  algorithm?: (
    base: number,
    key: TypographyScaleKey,
    step: number,
    previousValue: number | null,
  ) => number;
  precision?: number;
};

export type TypographySource = {
  families: Record<TypographyFamilyKey, string>;
  weights: Record<TypographyWeightKey, number>;
  lineHeights: Record<TypographyLineHeightKey, number>;
  letterSpacings: Record<TypographyLetterSpacingKey, string>;
  scale: TypographyScaleConfig;
  styles: TypographyStyles;
};

export type TypographyScaleTokens = Record<
  TypographyScaleKey,
  { value: number; unit: TypographyScaleUnit }
>;

export type TypographyTokens = {
  families: Record<TypographyFamilyKey, string>;
  weights: Record<TypographyWeightKey, number>;
  lineHeights: Record<TypographyLineHeightKey, number>;
  letterSpacings: Record<TypographyLetterSpacingKey, string>;
  scale: TypographyScaleTokens;
  styles: TypographyStyles;
};

export type TypographyBuilderOptions = {
  unit?: TypographyScaleUnit;
  prefix?: string;
};
