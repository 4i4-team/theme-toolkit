import { normalizeCssVariablePrefix, sanitizeIdentifierSegment } from "../../core/common";
import type { CssVariablesNode, ResolveCssVariableName } from "../../core/common";
import type { TypographyPropertyTokens, TypographyTokens, FontSizeExtras } from "./types";

const PROPERTY_CSS_MAP: Record<string, string> = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontWeight: "font-weight",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing",
  fontStyle: "font-style",
  textTransform: "text-transform",
  textDecoration: "text-decoration",
  textAlign: "text-align",
};

export const tokenizeTypographyProperty = (
  name: string,
  normalized: { base: unknown; variants?: Record<string, { base: unknown }> },
  baseToken: TypographyPropertyTokens,
): TypographyPropertyTokens => {
  const variants: Record<string, string | number> = { base: normalized.base as string | number };
  if (normalized.variants) {
    for (const [variantName, def] of Object.entries(normalized.variants)) {
      variants[variantName] = def.base as string | number;
    }
  }
  return { ...baseToken, base: normalized.base as string | number, variants };
};

export const mapTypographyCssVariables = (
  tokens: TypographyTokens,
  prefix: string,
  options?: { unit?: "px" | "rem"; baseFontSize?: number },
): Record<string, string> => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};
  const unit = options?.unit ?? "px";
  const baseFontSize = options?.baseFontSize ?? 16;

  for (const [propertyKey, token] of Object.entries(tokens)) {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);

    for (const [variantName, value] of Object.entries(token.variants)) {
      const formatted = formatTokenValue(propertyKey, value, unit, baseFontSize);
      const varName = `${normalizedPrefix}-${cssName}--${sanitizeIdentifierSegment(variantName)}`;
      variables[varName] = formatted;
    }
  }

  return variables;
};

export const buildTypographyVariableNodes = (
  tokens: TypographyTokens,
  prefix?: string,
): CssVariablesNode[] => {
  const variables = mapTypographyCssVariables(tokens, prefix ?? "dt");
  return Object.keys(variables).length
    ? [{ kind: "variables" as const, selector: ":root", variables }]
    : [];
};

export const createTypographyCssVariableResolver = (
  prefix: string,
): ResolveCssVariableName => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  return (propertyKey: string, variant?: string): string => {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);
    const variantSegment = sanitizeIdentifierSegment(variant ?? "base");
    return `${normalizedPrefix}-${cssName}--${variantSegment}`;
  };
};

const formatTokenValue = (
  propertyKey: string,
  value: string | number,
  unit: "px" | "rem" = "px",
  baseFontSize = 16,
): string => {
  if (typeof value === "string") return value;
  if (propertyKey === "fontSize") {
    if (unit === "rem") {
      const remValue = Number((value / baseFontSize).toFixed(4));
      return `${remValue}rem`;
    }
    return `${value}px`;
  }
  return String(value);
};

export const createTypographyStyle = (
  tokens: TypographyTokens,
  prefix: string,
  group: string,
  variant: string,
  recipes?: Record<string, Record<string, Record<string, unknown>>>,
) => {
  const definition = recipes?.[group]?.[variant];
  if (!definition) {
    throw new Error(`Typography recipe "${group}.${variant}" is not defined.`);
  }

  const resolve = createTypographyCssVariableResolver(prefix);
  const result: Record<string, string> = {};

  for (const [propKey, tokenRef] of Object.entries(definition)) {
    if (typeof tokenRef !== "string") continue;
    const cssProperty = PROPERTY_CSS_MAP[propKey];
    if (!cssProperty) continue;
    result[cssProperty] = `var(${resolve(propKey, tokenRef)})`;
  }

  return result;
};
