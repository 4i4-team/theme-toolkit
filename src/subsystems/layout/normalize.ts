import type { NormalizedPropertyValue } from "../../core/common";

export const finalizeLayoutNormalization = (
  propertyKey: string,
  normalized: NormalizedPropertyValue<unknown>,
): NormalizedPropertyValue<unknown> => {
  if (propertyKey === "spacing" || propertyKey === "gutters") {
    return forceNoneVariant(normalized);
  }
  return normalized;
};

const forceNoneVariant = (
  normalized: NormalizedPropertyValue<unknown>,
): NormalizedPropertyValue<unknown> => {
  const variants = normalized.variants ?? {};
  return {
    ...normalized,
    variants: {
      ...variants,
      none: { base: 0 },
    },
  } as unknown as NormalizedPropertyValue<unknown>;
};
