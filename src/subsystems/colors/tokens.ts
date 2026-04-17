import type {
  NormalizedPaletteValue,
  PaletteTokens,
  PaletteVariantMap,
} from "./types";
import { lighten, darken } from "./utils";
import {
  normalizeCssVariablePrefix,
  sanitizeIdentifierSegment,
} from "../../core/common";
import type { ResolveCssVariableName } from "../../core/common";

const DEFAULT_STEPS = ["light", "lighter", "dark", "darker"];
const DEFAULT_LIGHTEN_BY = 20;
const DEFAULT_DARKEN_BY = 20;

const NAMED_LIGHTER_ORDER = ["light", "lighter"];
const NAMED_DARKER_ORDER = ["dark", "darker"];

const ensureVariantSteps = (palette: NormalizedPaletteValue): string[] => {
  if (palette.steps && palette.steps.length) {
    return palette.steps.map(step => step.toString());
  }
  return DEFAULT_STEPS;
};

const classifySteps = (
  steps: string[],
  baseStep?: string,
): { lighterSteps: string[]; darkerSteps: string[]; baseStepName: string | undefined } => {
  const allNumeric = steps.every(s => !isNaN(Number(s)));

  if (allNumeric) {
    const sorted = [...steps].sort((a, b) => Number(a) - Number(b));
    const resolvedBase = baseStep?.toString();
    let baseIdx = resolvedBase ? sorted.indexOf(resolvedBase) : -1;

    if (baseIdx < 0) {
      baseIdx = sorted.indexOf("500");
    }
    if (baseIdx < 0) {
      baseIdx = Math.floor(sorted.length / 2);
    }

    const lighterSteps = sorted.slice(0, baseIdx).reverse();
    const darkerSteps = sorted.slice(baseIdx + 1);
    return { lighterSteps, darkerSteps, baseStepName: sorted[baseIdx] };
  }

  const lighterSet = new Set(NAMED_LIGHTER_ORDER);
  const darkerSet = new Set(NAMED_DARKER_ORDER);

  const lighterSteps = steps
    .filter(s => lighterSet.has(s))
    .sort((a, b) => NAMED_LIGHTER_ORDER.indexOf(a) - NAMED_LIGHTER_ORDER.indexOf(b));

  const darkerSteps = steps
    .filter(s => darkerSet.has(s))
    .sort((a, b) => NAMED_DARKER_ORDER.indexOf(a) - NAMED_DARKER_ORDER.indexOf(b));

  const unknown = steps.filter(s => !lighterSet.has(s) && !darkerSet.has(s));
  darkerSteps.push(...unknown);

  return { lighterSteps, darkerSteps, baseStepName: undefined };
};

const buildPaletteVariantMap = (palette: NormalizedPaletteValue): PaletteVariantMap => {
  const steps = ensureVariantSteps(palette);
  const existingVariants = Object.fromEntries(
    Object.entries(palette.variants ?? {}).map(([name, def]) => [name, def.base]),
  );
  const variants: PaletteVariantMap = { main: palette.base, ...existingVariants };

  const { lighterSteps, darkerSteps, baseStepName } = classifySteps(
    steps,
    palette.baseStep?.toString(),
  );

  if (baseStepName && !variants[baseStepName]) {
    variants[baseStepName] = palette.base;
  }

  const lightenAmount = palette.lightenBy ?? DEFAULT_LIGHTEN_BY;
  const darkenAmount = palette.darkenBy ?? DEFAULT_DARKEN_BY;

  let prev = palette.base;
  for (const step of lighterSteps) {
    if (variants[step]) {
      prev = variants[step];
      continue;
    }
    if (palette.algorithm) {
      variants[step] = palette.algorithm(prev, step);
      prev = variants[step];
      continue;
    }
    const result = lighten(prev, lightenAmount);
    variants[step] = result;
    prev = result;
  }

  prev = palette.base;
  for (const step of darkerSteps) {
    if (variants[step]) {
      prev = variants[step];
      continue;
    }
    if (palette.algorithm) {
      variants[step] = palette.algorithm(prev, step);
      prev = variants[step];
      continue;
    }
    const result = darken(prev, darkenAmount);
    variants[step] = result;
    prev = result;
  }

  return variants;
};

export const tokenizePaletteProperty = (
  name: string,
  normalized: NormalizedPaletteValue,
  baseToken: PaletteTokens,
): PaletteTokens => ({
  ...baseToken,
  text: normalized.text,
  variants: buildPaletteVariantMap(normalized),
});

export const mapPaletteCssVariables = <T extends string>(
  tokens: Record<T, PaletteTokens>,
  prefix: string,
): Record<string, string> => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};

  (Object.keys(tokens) as T[]).forEach(name => {
    const token = tokens[name];
    const segment = sanitizeIdentifierSegment(name);
    const colorBase = `${normalizedPrefix}-color--${segment}`;
    const textBase = `${normalizedPrefix}-text--${segment}`;

    variables[colorBase] = token.variants.main;
    variables[textBase] = token.text;

    Object.entries(token.variants).forEach(([variant, value]) => {
      const variantSegment = sanitizeIdentifierSegment(variant);
      variables[`${colorBase}--${variantSegment}`] = value;
    });
  });

  return variables;
};

/**
 * Matches the CSS-variable naming used by `mapPaletteCssVariables` so that
 * responsive / variant-swap expansion produces names that actually exist in
 * the generated `:root`.
 *
 *   resolve("primary")                 → --prefix-color--primary
 *   resolve("primary", "light")        → --prefix-color--primary--light
 *   resolve("primary", undefined, "text")  → --prefix-text--primary
 *
 * The `text` field is palette-specific — it lives on the property root, not
 * on individual variants — so a (variant, "text") lookup collapses to the
 * root's text var. Unknown `field` values fall through to the color family.
 */
export const createPaletteCssVariableResolver = (
  prefix: string,
): ResolveCssVariableName => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  return (name: string, variant?: string, field?: string): string => {
    const segment = sanitizeIdentifierSegment(name);
    if (field === "text") {
      return `${normalizedPrefix}-text--${segment}`;
    }
    const colorBase = `${normalizedPrefix}-color--${segment}`;
    if (variant) {
      return `${colorBase}--${sanitizeIdentifierSegment(variant)}`;
    }
    return colorBase;
  };
};
