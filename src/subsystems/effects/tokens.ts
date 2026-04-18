import {
  normalizeCssVariablePrefix,
  sanitizeIdentifierSegment,
} from "../../core/common";
import type {
  CssVariablesNode,
  ResolveCssVariableName,
} from "../../core/common";
import type { EffectsPropertyTokens, EffectsTokens } from "./types";

const PROPERTY_CSS_MAP: Record<string, string> = {
  radius: "radius",
  shadow: "shadow",
  blur: "blur",
  zIndex: "z-index",
  opacity: "opacity",
  outline: "outline",
  borderWidth: "border-width",
  transitions: "transition",
};

export const tokenizeEffectsProperty = (
  name: string,
  normalized: { base: unknown; variants?: Record<string, { base: unknown }> },
  baseToken: EffectsPropertyTokens,
): EffectsPropertyTokens => {
  const variants: Record<string, string | number> = { base: normalized.base as string | number };
  if (normalized.variants) {
    for (const [variantName, def] of Object.entries(normalized.variants)) {
      variants[variantName] = def.base as string | number;
    }
  }
  return { ...baseToken, base: normalized.base as string | number, variants };
};

export const mapEffectsCssVariables = (
  tokens: EffectsTokens,
  prefix: string,
): Record<string, string> => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  const variables: Record<string, string> = {};

  for (const [propertyKey, token] of Object.entries(tokens)) {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);

    for (const [variantName, value] of Object.entries(token.variants)) {
      const formatted = formatEffectsValue(propertyKey, value);
      const varName = `${normalizedPrefix}-effects-${cssName}--${sanitizeIdentifierSegment(variantName)}`;
      variables[varName] = formatted;
    }
  }

  return variables;
};

export const createEffectsCssVariableResolver = (
  prefix: string,
): ResolveCssVariableName => {
  const normalizedPrefix = normalizeCssVariablePrefix(prefix);
  return (propertyKey: string, variant?: string): string => {
    const cssName = PROPERTY_CSS_MAP[propertyKey] ?? sanitizeIdentifierSegment(propertyKey);
    const variantSegment = sanitizeIdentifierSegment(variant ?? "base");
    return `${normalizedPrefix}-effects-${cssName}--${variantSegment}`;
  };
};

const formatEffectsValue = (propertyKey: string, value: string | number): string => {
  if (typeof value === "string") return value;
  if (propertyKey === "radius" || propertyKey === "borderWidth") return `${value}px`;
  if (propertyKey === "blur") return `${value}px`;
  if (propertyKey === "zIndex") return String(value);
  if (propertyKey === "opacity") return String(value);
  return String(value);
};
