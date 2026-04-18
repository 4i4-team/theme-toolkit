import { normalizeCssVariablePrefix } from "../../core/common";
import type { CssVariablesNode } from "../../core/common";
import type {
  TypographyBuilderOptions,
  TypographyRatioKey,
  TypographyScaleConfig,
  TypographyScaleKey,
  TypographyScaleSteps,
  TypographyScaleTokens,
  TypographyScaleUnit,
  TypographySource,
  TypographyStyles,
  TypographyTokens,
} from "./types";

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
  let previousValue: number | null = null;

  return (Object.entries(finalSteps) as Array<[TypographyScaleKey, number]>).reduce(
    (accumulator, [key, step]) => {
      const provided = variants?.[key];
      let value = provided;

      if (value === undefined) {
        if (algorithm) {
          value = algorithm(baseFontSize, key, step, previousValue);
        } else {
          value = baseFontSize * Math.pow(ratioValue, step);
        }
      }

      const rounded = Number(value.toFixed(precision));
      previousValue = rounded;

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
});

export const buildTypographyVariableNodes = (
  tokens: TypographyTokens,
  prefix?: string,
): CssVariablesNode[] => {
  const normalized = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};

  for (const [familyKey, family] of Object.entries(tokens.families)) {
    variables[`${normalized}-font-family--${familyKey}`] = family;
  }
  for (const [weightKey, weight] of Object.entries(tokens.weights)) {
    variables[`${normalized}-font-weight--${weightKey}`] = String(weight);
  }
  for (const [lineKey, lineHeight] of Object.entries(tokens.lineHeights)) {
    variables[`${normalized}-line-height--${lineKey}`] = String(lineHeight);
  }
  for (const [spacingKey, spacing] of Object.entries(tokens.letterSpacings)) {
    variables[`${normalized}-letter-spacing--${spacingKey}`] = spacing;
  }
  for (const [scaleKey, scaleValues] of Object.entries(tokens.scale)) {
    variables[`${normalized}-font-size--${scaleKey}`] = `${scaleValues.value}${scaleValues.unit}`;
  }

  return Object.keys(variables).length
    ? [{ kind: "variables" as const, selector: ":root", variables }]
    : [];
};

export const createTypographyStyle = (
  tokens: TypographyTokens,
  recipes: TypographyStyles | undefined,
  group: string,
  variant: string,
) => {
  const definition = recipes?.[group]?.[variant];
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
