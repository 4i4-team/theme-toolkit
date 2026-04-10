import { css } from "styled-components";

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
    query?: 'min' | 'max' | 'exact';
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

const TYPOGRAPHY_RATIOS: Record<TypographyRatioKey, number> = {
  "minor-second": 1.067,
  "major-second": 1.125,
  "minor-third": 1.2,
  "major-third": 1.25,
  "perfect-fourth": 1.333,
  "augmented-fourth": 1.414,
  "perfect-fifth": 1.5,
  golden: 1.618,
};

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
  {
    value: number;
    unit: TypographyScaleUnit;
  }
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

const DEFAULT_PRECISION = 4;
const DEFAULT_SCALE_STEPS: TypographyScaleSteps = {
  xs: -2,
  sm: -1,
  md: 0,
  lg: 1,
  xl: 2,
  "2xl": 3,
  "3xl": 4,
  "4xl": 5,
};

const buildScaleTokens = (
  config: TypographyScaleConfig,
  unit: TypographyScaleUnit,
): TypographyScaleTokens => {
  const { baseFontSize, ratio, steps, variants, algorithm, precision = DEFAULT_PRECISION } = config;
  const ratioValue = TYPOGRAPHY_RATIOS[ratio];
  const finalSteps = { ...DEFAULT_SCALE_STEPS, ...steps } as TypographyScaleSteps;

  return (Object.entries(finalSteps) as Array<[TypographyScaleKey, number]>).reduce(
    (accumulator, [key, step]) => {
      const provided = variants?.[key];
      let value = provided;

      if (value === undefined) {
        if (algorithm) {
          const previous = accumulator[key]?.value ?? null;
          value = algorithm(baseFontSize, key, step, previous);
        } else {
          value = baseFontSize * Math.pow(ratioValue, step);
        }
      }

      const rounded = Number(value.toFixed(precision));

      accumulator[key] = {
        value: unit === "rem" ? rounded / baseFontSize : rounded,
        unit,
      };

      return accumulator;
    },
    {} as TypographyScaleTokens,
  );
};

export const buildTypographyTokens = (
  source: TypographySource,
  options?: TypographyBuilderOptions,
): TypographyTokens => ({
  families: source.families,
  weights: source.weights,
  lineHeights: source.lineHeights,
  letterSpacings: source.letterSpacings,
  scale: buildScaleTokens(source.scale, options?.unit ?? "px"),
  styles: source.styles,
});

const DEFAULT_PREFIX = "--dt";

const normalizePrefix = (prefix?: string): string => {
  const normalized = prefix?.trim() || DEFAULT_PREFIX;
  return normalized.startsWith("--") ? normalized : `--${normalized}`;
};

export const serializeTypographyToCSS = (
  tokens: TypographyTokens,
  prefix?: string,
): string => {
  const normalized = normalizePrefix(prefix);
  const parts: string[] = [];

  for (const [familyKey, family] of Object.entries(tokens.families)) {
    parts.push(`${normalized}-font-family--${familyKey}: ${family};`);
  }

  for (const [weightKey, weight] of Object.entries(tokens.weights)) {
    parts.push(`${normalized}-font-weight--${weightKey}: ${weight};`);
  }

  for (const [lineKey, lineHeight] of Object.entries(tokens.lineHeights)) {
    parts.push(`${normalized}-line-height--${lineKey}: ${lineHeight};`);
  }

  for (const [spacingKey, spacing] of Object.entries(tokens.letterSpacings)) {
    parts.push(`${normalized}-letter-spacing--${spacingKey}: ${spacing};`);
  }

  for (const [scaleKey, scaleValues] of Object.entries(tokens.scale)) {
    parts.push(
      `${normalized}-font-size--${scaleKey}: ${scaleValues.value}${scaleValues.unit};`,
    );
  }

  return parts.join("\n");
};

export const createTypographyStyle = (
  tokens: TypographyTokens,
  group: string,
  variant: string,
) => {
  const definition = tokens.styles[group]?.[variant];

  if (!definition) {
    throw new Error(`Typography variant "${group}.${variant}" is not defined.`);
  }

  const family = tokens.families[definition.family];
  const scale = tokens.scale[definition.size];
  const weight = tokens.weights[definition.weight];
  const lineHeight = tokens.lineHeights[definition.lineHeight];
  const letterSpacing = tokens.letterSpacings[definition.letterSpacing];

  return {
    fontFamily: family,
    fontSize: `${scale.value}${scale.unit}`,
    fontWeight: weight,
    lineHeight,
    letterSpacing,
  };
};

export const typographyMixin = (
  tokens: TypographyTokens,
  group: string,
  variant: string,
) => {
  const styles = createTypographyStyle(tokens, group, variant);

  const mixin = css`
    font-family: ${styles.fontFamily};
    font-size: ${styles.fontSize};
    font-weight: ${styles.fontWeight};
    line-height: ${styles.lineHeight};
    letter-spacing: ${styles.letterSpacing};
  `;

  Object.defineProperty(mixin, "toString", {
    value: () =>
      `font-family: ${styles.fontFamily};font-size: ${styles.fontSize};font-weight: ${styles.fontWeight};line-height: ${styles.lineHeight};letter-spacing: ${styles.letterSpacing};`,
    configurable: true,
  });

  return mixin;
};
