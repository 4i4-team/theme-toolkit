import type {
  RecipeGroupDefinition,
  NormalizedRecipeGroup,
  RecipeVariantDefinition,
  RecipeResponsiveOverride,
} from "./types";

export type RecipeNormalizationOptions<TBreakpoint extends string> = {
  propertyPath?: string;
  allowedBreakpoints?: ReadonlyArray<TBreakpoint> | ReadonlySet<TBreakpoint>;
};

const DEFAULT_QUERY = "exact" as const;

type AllowedValues<T> = ReadonlyArray<T> | ReadonlySet<T>;

const isAllowedValue = <T>(value: T, allowed?: AllowedValues<T>): boolean => {
  if (!allowed) {
    return true;
  }

  if (Array.isArray(allowed)) {
    return allowed.includes(value);
  }

  return (allowed as ReadonlySet<T>).has(value);
};

const formatContextLabel = (path?: string): string => (path ? ` for "${path}"` : "");

export const normalizeRecipeGroup = <
  TProps extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  group: RecipeGroupDefinition<TProps, TBreakpoint>,
  options: RecipeNormalizationOptions<TBreakpoint> = {},
): NormalizedRecipeGroup<TProps, TBreakpoint> => {
  const variantNames = Object.keys(group);
  const allowedVariantSet = variantNames.length
    ? (new Set(variantNames) as ReadonlySet<string>)
    : undefined;

  const normalized = {} as NormalizedRecipeGroup<TProps, TBreakpoint>;

  variantNames.forEach(variantName => {
    const variant = group[variantName];
    normalized[variantName] = normalizeRecipeVariant(
      `${options.propertyPath ?? "recipes"}.${variantName}`,
      variant,
      {
        allowedBreakpoints: options.allowedBreakpoints,
        allowedTargets: allowedVariantSet,
        allowedVariants: allowedVariantSet,
      },
    );
  });

  return normalized;
};

type RecipeResponsiveContext<TBreakpoint extends string> = {
  allowedBreakpoints?: AllowedValues<TBreakpoint>;
  allowedTargets?: AllowedValues<string>;
  allowedVariants?: AllowedValues<string>;
};

const normalizeRecipeVariant = <
  TProps extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  path: string,
  variant: RecipeVariantDefinition<TProps, TBreakpoint>,
  context: RecipeResponsiveContext<TBreakpoint>,
) => {
  const { responsive, ...base } = variant;
  const normalizedResponsive = normalizeRecipeResponsive(responsive, path, context);

  return {
    base: base as TProps,
    responsive: normalizedResponsive,
  };
};

const normalizeRecipeResponsive = <
  TProps extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  overrides: RecipeResponsiveOverride<TProps, TBreakpoint>[] | undefined,
  path: string,
  context: RecipeResponsiveContext<TBreakpoint>,
): RecipeResponsiveOverride<TProps, TBreakpoint>[] => {
  if (!overrides?.length) {
    return [];
  }

  return overrides.map(entry => {
    if (!entry.breakpoint) {
      throw new Error(
        `Responsive recipe entry${formatContextLabel(path)} is missing a "breakpoint" value.`,
      );
    }

    if (
      context.allowedBreakpoints &&
      !isAllowedValue(entry.breakpoint, context.allowedBreakpoints)
    ) {
      throw new Error(
        `Responsive recipe entry${formatContextLabel(path)} references unknown breakpoint "${entry.breakpoint}".`,
      );
    }

    if (entry.variant && !isAllowedValue(entry.variant, context.allowedVariants)) {
      throw new Error(
        `Responsive recipe entry${formatContextLabel(path)} references unknown variant "${entry.variant}".`,
      );
    }

    if (entry.target && !isAllowedValue(entry.target, context.allowedTargets)) {
      throw new Error(
        `Responsive recipe entry${formatContextLabel(path)} references unknown target "${entry.target}".`,
      );
    }

    return {
      ...entry,
      query: entry.query ?? DEFAULT_QUERY,
    };
  });
};
