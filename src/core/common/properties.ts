import {
  ExtendedProperty,
  NormalizedPropertyValue,
  NormalizedVariantValue,
  PropertyNormalizationOptions,
  PropertyValue,
  VariantValue,
} from "./types";
import { normalizeResponsiveOverrides } from "./responsive";

const formatPropertyLabel = (path?: string): string =>
  path ? ` for "${path}"` : "";

const isExtendedProperty = <
  TValue,
  TExtra extends Record<string, unknown>,
  TBreakpoint extends string,
>(value: PropertyValue<TValue, TExtra, TBreakpoint>): value is ExtendedProperty<TValue, TExtra, TBreakpoint> =>
  typeof value === "object" && value !== null;

const resolveBaseValue = <TValue, TBreakpoint extends string>(
  providedBase: TValue | undefined,
  fallback: TValue | undefined,
  options: PropertyNormalizationOptions<TValue, TBreakpoint>,
): TValue => {
  const candidate = providedBase ?? fallback ?? options.fallbackBase;

  if (candidate === undefined) {
    throw new Error(`Unable to resolve base value${formatPropertyLabel(options.propertyPath)}.`);
  }

  return options.coerceValue ? options.coerceValue(candidate) : candidate;
};

const normalizeVariant = <
  TValue,
  TExtra extends Record<string, unknown>,
  TBreakpoint extends string,
>(
  name: string,
  variant: VariantValue<TValue, TExtra, TBreakpoint>,
  options: PropertyNormalizationOptions<TValue, TBreakpoint>,
): NormalizedVariantValue<TValue, TExtra, TBreakpoint> => {
  const variantPath = options.propertyPath
    ? `${options.propertyPath}.variants.${name}`
    : `variants.${name}`;

  const extended = isExtendedProperty<TValue, TExtra, TBreakpoint>(variant)
    ? variant
    : ({ base: variant } as ExtendedProperty<TValue, TExtra, TBreakpoint>);

  const { base, ...rest } = extended;
  const extra = rest as unknown as TExtra;
  const resolvedBase = resolveBaseValue(base, undefined, {
    ...options,
    propertyPath: variantPath,
  });

  return {
    ...extra,
    base: resolvedBase,
  };
};

export const normalizePropertyValue = <
  TValue,
  TExtra extends Record<string, unknown> = Record<string, never>,
  TBreakpoint extends string = string,
>(
  value: PropertyValue<TValue, TExtra, TBreakpoint>,
  options: PropertyNormalizationOptions<TValue, TBreakpoint> = {},
): NormalizedPropertyValue<TValue, TExtra, TBreakpoint> => {
  const extended = isExtendedProperty<TValue, TExtra, TBreakpoint>(value)
    ? value
    : ({ base: value } as ExtendedProperty<TValue, TExtra, TBreakpoint>);

  const { base, responsive, variants, ...rest } = extended;
  const extra = rest as unknown as TExtra;
  const resolvedBase = resolveBaseValue(base, options.fallbackBase, options);
  const normalizedVariants = variants
    ? Object.fromEntries(
        Object.entries(variants).map(([name, definition]) => [
          name,
          normalizeVariant(name, definition, options),
        ]),
      )
    : undefined;
  const responsiveContext = {
    propertyPath: options.propertyPath,
    allowedBreakpoints: options.allowedBreakpoints,
  } as const;

  return {
    ...extra,
    base: resolvedBase,
    responsive: normalizeResponsiveOverrides(responsive, responsiveContext),
    variants: normalizedVariants,
  };
};
