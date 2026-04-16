import type {
  NormalizedPaletteValue,
  PaletteTokens,
  PaletteVariantMap,
} from "./types";
import { lighten, darken } from "./utils";
import { sanitizeIdentifierSegment } from "../../core/common";

const DEFAULT_STEPS = ["light", "lighter", "dark", "darker"];

const ensureVariantSteps = (palette: NormalizedPaletteValue): string[] => {
  if (palette.steps && palette.steps.length) {
    return palette.steps.map(step => step.toString());
  }

  return DEFAULT_STEPS;
};

const buildPaletteVariantMap = (palette: NormalizedPaletteValue): PaletteVariantMap => {
  const steps = ensureVariantSteps(palette);
  const variants: PaletteVariantMap = {
    main: palette.base,
    ...Object.fromEntries(
      Object.entries(palette.variants ?? {}).map(([name, definition]) => [name, definition.base]),
    ),
  };

  for (const step of steps) {
    if (variants[step]) {
      continue;
    }

    if (palette.algorithm) {
      variants[step] = palette.algorithm(palette.base, step);
      continue;
    }

    switch (step) {
      case "light":
        variants[step] = lighten(palette.base, palette.lightenBy ?? 30);
        break;
      case "lighter":
        variants[step] = lighten(palette.base, palette.lightenBy ?? 60);
        break;
      case "dark":
        variants[step] = darken(palette.base, palette.darkenBy ?? 30);
        break;
      case "darker":
        variants[step] = darken(palette.base, palette.darkenBy ?? 60);
        break;
      default:
        variants[step] = palette.lightenBy
          ? lighten(palette.base, palette.lightenBy)
          : darken(palette.base, palette.darkenBy ?? 30);
    }
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
  const normalizedPrefix = prefix.startsWith("--") ? prefix : `--${prefix}`;
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
