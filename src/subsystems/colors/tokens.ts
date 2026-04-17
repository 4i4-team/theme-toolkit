import type {
  NormalizedPaletteValue,
  PaletteTokens,
  PaletteVariantMap,
} from "./types";
import {
  normalizeCssVariablePrefix,
  sanitizeIdentifierSegment,
} from "../../core/common";
import type { ResolveCssVariableName } from "../../core/common";

const buildPaletteVariantMap = (palette: NormalizedPaletteValue): PaletteVariantMap => {
  const variants: PaletteVariantMap = { main: palette.base };
  if (palette.variants) {
    for (const [name, def] of Object.entries(palette.variants)) {
      variants[name] = def.base;
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
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};

  (Object.keys(tokens) as T[]).forEach(name => {
    const token = tokens[name];
    const segment = sanitizeIdentifierSegment(name);
    const colorBase = `${normalizedPrefix}-color--${segment}`;
    const textBase = `${normalizedPrefix}-text--${segment}`;

    variables[colorBase] = token.variants.main;
    if (token.text) {
      variables[textBase] = token.text;
    }

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
