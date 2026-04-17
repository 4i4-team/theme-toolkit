import type { NormalizedPaletteValue } from "./types";
import type { NormalizedVariantValue } from "../../core/common";
import type { PalettePropertyExtras } from "./types";
import { lighten, darken } from "./utils";

type PaletteVariant = NormalizedVariantValue<string, PalettePropertyExtras>;

const DEFAULT_STEPS = ["light", "lighter", "dark", "darker"];
const DEFAULT_LIGHTEN_BY = 20;
const DEFAULT_DARKEN_BY = 20;

const NAMED_LIGHTER_ORDER = ["light", "lighter"];
const NAMED_DARKER_ORDER = ["dark", "darker"];

export const finalizePaletteNormalization = (
  name: string,
  normalized: NormalizedPaletteValue,
): NormalizedPaletteValue => {
  const stepVariants = generateStepVariants(normalized);
  if (!Object.keys(stepVariants).length) {
    return normalized;
  }

  return {
    ...normalized,
    variants: {
      ...stepVariants,
      ...normalized.variants,
    },
  };
};

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

const generateStepVariants = (palette: NormalizedPaletteValue): Record<string, PaletteVariant> => {
  const steps = ensureVariantSteps(palette);
  const existingVariants = palette.variants ?? {};
  const result: Record<string, PaletteVariant> = {};

  const { lighterSteps, darkerSteps, baseStepName } = classifySteps(
    steps,
    palette.baseStep?.toString(),
  );

  if (baseStepName && !existingVariants[baseStepName]) {
    result[baseStepName] = { base: palette.base } as PaletteVariant;
  }

  const lightenAmount = palette.lightenBy ?? DEFAULT_LIGHTEN_BY;
  const darkenAmount = palette.darkenBy ?? DEFAULT_DARKEN_BY;

  let prev = palette.base;
  for (const step of lighterSteps) {
    if (existingVariants[step]) {
      prev = existingVariants[step].base;
      continue;
    }
    if (palette.algorithm) {
      const value = palette.algorithm(prev, step, palette.base);
      result[step] = { base: value } as PaletteVariant;
      prev = value;
      continue;
    }
    const value = lighten(prev, lightenAmount);
    result[step] = { base: value } as PaletteVariant;
    prev = value;
  }

  prev = palette.base;
  for (const step of darkerSteps) {
    if (existingVariants[step]) {
      prev = existingVariants[step].base;
      continue;
    }
    if (palette.algorithm) {
      const value = palette.algorithm(prev, step, palette.base);
      result[step] = { base: value } as PaletteVariant;
      prev = value;
      continue;
    }
    const value = darken(prev, darkenAmount);
    result[step] = { base: value } as PaletteVariant;
    prev = value;
  }

  return result;
};
