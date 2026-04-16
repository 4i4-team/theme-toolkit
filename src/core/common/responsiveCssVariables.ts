import type { MediaDescriptor } from "../media";
import type { CssVariableMap } from "./cssVariables";
import { DEFAULT_RESPONSIVE_QUERY } from "./responsive";
import type { NormalizedPropertyValue } from "./types";

export type ResolveCssVariableName = (
  propertyName: string,
  variant?: string,
  field?: string,
) => string;

export type ResponsiveCssVariableSection = {
  media: string;
  variables: CssVariableMap;
};

export type ExpandResponsiveCssVariablesOptions<TBreakpoint extends string> = {
  resolveCssVariable: ResolveCssVariableName;
  media: MediaDescriptor<TBreakpoint>;
  formatValue?: (value: unknown) => string;
};

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target"]);

const defaultFormatValue = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

export const expandResponsiveCssVariables = <
  TValue,
  TExtra extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  properties: Record<string, NormalizedPropertyValue<TValue, TExtra, TBreakpoint>>,
  options: ExpandResponsiveCssVariablesOptions<TBreakpoint>,
): ResponsiveCssVariableSection[] => {
  const { resolveCssVariable, media, formatValue = defaultFormatValue } = options;
  const sectionsByMedia = new Map<string, CssVariableMap>();

  for (const [propertyName, property] of Object.entries(properties)) {
    for (const entry of property.responsive) {
      const group = media.groups[entry.breakpoint];
      if (!group) continue;
      const mediaQuery = group[entry.query ?? DEFAULT_RESPONSIVE_QUERY];
      if (!mediaQuery) continue;

      const updates = computeEntryUpdates(
        propertyName,
        entry as Record<string, unknown>,
        resolveCssVariable,
        formatValue,
      );
      if (!Object.keys(updates).length) continue;

      const existing = sectionsByMedia.get(mediaQuery);
      if (existing) {
        Object.assign(existing, updates);
      } else {
        sectionsByMedia.set(mediaQuery, { ...updates });
      }
    }
  }

  return Array.from(sectionsByMedia, ([media, variables]) => ({ media, variables }));
};

const computeEntryUpdates = (
  propertyName: string,
  entry: Record<string, unknown>,
  resolveCssVariable: ResolveCssVariableName,
  formatValue: (value: unknown) => string,
): CssVariableMap => {
  const variant = typeof entry.variant === "string" ? entry.variant : undefined;
  const target = typeof entry.target === "string" ? entry.target : undefined;

  if (variant !== undefined && target !== undefined) {
    throw new Error(
      `Responsive entry for "${propertyName}" cannot set both "variant" and "target".`,
    );
  }

  const updates: CssVariableMap = {};
  const scope = variant ?? target;

  if (variant !== undefined) {
    const baseVar = resolveCssVariable(propertyName);
    const variantBaseVar = resolveCssVariable(propertyName, variant);
    updates[baseVar] = `var(${variantBaseVar})`;
  }

  for (const [field, value] of Object.entries(entry)) {
    if (RESERVED_KEYS.has(field)) continue;
    const varName =
      field === "base"
        ? resolveCssVariable(propertyName, scope)
        : resolveCssVariable(propertyName, scope, field);
    updates[varName] = formatValue(value);
  }

  return updates;
};
