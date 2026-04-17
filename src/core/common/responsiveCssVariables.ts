import type { MediaDescriptor } from "../media";
import type { CssVariablesNode } from "./cssNodes";
import type { CssVariableMap } from "./cssVariables";
import { DEFAULT_RESPONSIVE_QUERY } from "./responsive";
import type { NormalizedPropertyValue, ResponsiveOrientation, ResponsiveQuery } from "./types";

export type ResolveCssVariableName = (
  propertyName: string,
  variant?: string,
  field?: string,
) => string;

export type ExpandResponsiveCssVariablesOptions<TBreakpoint extends string> = {
  resolveCssVariable: ResolveCssVariableName;
  media: MediaDescriptor<TBreakpoint>;
  formatValue?: (value: unknown) => string;
  selector?: string;
};

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);
const DEFAULT_SELECTOR = ":root";

const resolveMediaQuery = <TBreakpoint extends string>(
  media: MediaDescriptor<TBreakpoint>,
  breakpoint: TBreakpoint,
  query: ResponsiveQuery,
  orientation?: ResponsiveOrientation,
): string => {
  if (!orientation) {
    const group = media[breakpoint];
    return group?.[query] ?? "";
  }
  const opts = { orientation };
  if (query === "min") return media.min(breakpoint, opts);
  if (query === "max") return media.max(breakpoint, opts);
  return media.exact(breakpoint, opts);
};

const defaultFormatValue = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value);

export const expandResponsiveCssVariables = <
  TValue,
  TExtra extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  properties: Record<string, NormalizedPropertyValue<TValue, TExtra, TBreakpoint>>,
  options: ExpandResponsiveCssVariablesOptions<TBreakpoint>,
): CssVariablesNode[] => {
  const {
    resolveCssVariable,
    media,
    formatValue = defaultFormatValue,
    selector = DEFAULT_SELECTOR,
  } = options;
  const variablesByMedia = new Map<string, CssVariableMap>();

  for (const [propertyName, property] of Object.entries(properties)) {
    for (const entry of property.responsive) {
      const mediaQuery = resolveMediaQuery(
        media,
        entry.breakpoint,
        entry.query ?? DEFAULT_RESPONSIVE_QUERY,
        entry.orientation as ResponsiveOrientation | undefined,
      );
      if (!mediaQuery) continue;

      const updates = computeEntryUpdates(
        propertyName,
        entry as Record<string, unknown>,
        resolveCssVariable,
        formatValue,
      );
      if (!Object.keys(updates).length) continue;

      const existing = variablesByMedia.get(mediaQuery);
      if (existing) {
        Object.assign(existing, updates);
      } else {
        variablesByMedia.set(mediaQuery, { ...updates });
      }
    }
  }

  return Array.from(variablesByMedia, ([media, variables]): CssVariablesNode => ({
    kind: "variables",
    selector,
    media,
    variables,
  }));
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
