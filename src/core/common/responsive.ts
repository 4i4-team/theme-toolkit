import type {
  NormalizedPropertyValue,
  NormalizedResponsiveOverride,
  PropertyNormalizationOptions,
  ResponsiveOverride,
  ResponsiveQuery,
} from "./types";

export const DEFAULT_RESPONSIVE_QUERY: ResponsiveQuery = "exact";

type AllowedValues<T> = ReadonlyArray<T> | ReadonlySet<T>;

type ResponsiveNormalizationContext<TBreakpoint extends string> = Pick<
  PropertyNormalizationOptions<unknown, TBreakpoint>,
  "propertyPath" | "allowedBreakpoints"
> & {
  allowedTargets?: AllowedValues<string>;
  allowedVariants?: AllowedValues<string>;
};

const formatContextLabel = (context?: { propertyPath?: string }): string =>
  context?.propertyPath ? ` for "${context.propertyPath}"` : "";

const isAllowedValue = <T>(value: T, allowed?: AllowedValues<T>): boolean => {
  if (!allowed) {
    return true;
  }

  if (Array.isArray(allowed)) {
    return allowed.includes(value);
  }

  return (allowed as ReadonlySet<T>).has(value);
};

export function normalizeResponsiveOverrides<
  TValue,
  TExtra extends Record<string, unknown> = Record<string, never>,
  TBreakpoint extends string = string,
>(
  overrides: ResponsiveOverride<TValue, TExtra, TBreakpoint>[] | undefined,
  context?: ResponsiveNormalizationContext<TBreakpoint>,
): NormalizedResponsiveOverride<TValue, TExtra, TBreakpoint>[] {
  if (!overrides?.length) {
    return [];
  }

  return overrides.map(override => {
    if (!override.breakpoint) {
      throw new Error(
        `Responsive entry${formatContextLabel(context)} is missing a "breakpoint" value.`,
      );
    }

    if (
      context?.allowedBreakpoints &&
      !isAllowedValue(override.breakpoint, context.allowedBreakpoints)
    ) {
      throw new Error(
        `Responsive entry${formatContextLabel(context)} references unknown breakpoint "${override.breakpoint}".`,
      );
    }

    if (override.variant && !isAllowedValue(override.variant, context?.allowedVariants)) {
      throw new Error(
        `Responsive entry${formatContextLabel(context)} references unknown variant "${override.variant}".`,
      );
    }

    if (override.target && !isAllowedValue(override.target, context?.allowedTargets)) {
      throw new Error(
        `Responsive entry${formatContextLabel(context)} references unknown target "${override.target}".`,
      );
    }

    const { query, ...rest } = override;

    return {
      ...rest,
      query: query ?? DEFAULT_RESPONSIVE_QUERY,
    };
  });
}

export function validateNormalizedResponsiveRefs<
  TValue,
  TExtra extends Record<string, unknown> = Record<string, never>,
  TBreakpoint extends string = string,
>(
  normalized: NormalizedPropertyValue<TValue, TExtra, TBreakpoint>,
  options?: { propertyPath?: string },
): void {
  const variantNames = normalized.variants ? Object.keys(normalized.variants) : [];
  if (!variantNames.length) return;

  const allowed = new Set(variantNames);
  const label = options?.propertyPath ? ` for "${options.propertyPath}"` : "";

  for (const entry of normalized.responsive) {
    if (entry.variant && !allowed.has(entry.variant)) {
      throw new Error(
        `Responsive entry${label} references unknown variant "${entry.variant}".`,
      );
    }
    if (entry.target && !allowed.has(entry.target)) {
      throw new Error(
        `Responsive entry${label} references unknown target "${entry.target}".`,
      );
    }
  }
}
