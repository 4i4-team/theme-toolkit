import { normalizeCssVariablePrefix } from "../../core/common";
import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";

type TypographyStyleProps = {
  family?: string;
  size?: string;
  weight?: string;
  lineHeight?: string;
  letterSpacing?: string;
};

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

const PROPERTY_MAP: Record<string, string> = {
  family: "font-family",
  size: "font-size",
  weight: "font-weight",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing",
};

const VARIABLE_CATEGORY_MAP: Record<string, string> = {
  family: "font-family",
  size: "font-size",
  weight: "font-weight",
  lineHeight: "line-height",
  letterSpacing: "letter-spacing",
};

export const createTypographyCssVariableResolver = (prefix: string) => {
  const normalized = normalizeCssVariablePrefix(prefix);
  return (category: string, tokenName: string): string =>
    `${normalized}-${VARIABLE_CATEGORY_MAP[category] ?? category}--${tokenName}`;
};

export const interpretTypographyStyleVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<TypographyStyleProps, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const prefix = (context.options as { prefix?: string } | undefined)?.prefix ?? "";
  const resolve = createTypographyCssVariableResolver(prefix);

  const base = resolveStyleProps(variant.base, resolve);

  const responsive = variant.responsive.map(entry => {
    const overrides = resolveStyleProps(entry as TypographyStyleProps, resolve, true);
    return {
      ...overrides,
      breakpoint: entry.breakpoint,
      query: entry.query ?? "exact",
      ...(entry.orientation ? { orientation: entry.orientation } : {}),
    } as RecipeResponsiveOverride<RecipeStyleBlock, string> & {
      query: "min" | "max" | "exact";
    };
  });

  return { base, responsive };
};

const resolveStyleProps = (
  props: TypographyStyleProps,
  resolve: (category: string, tokenName: string) => string,
  skipReserved = false,
): RecipeStyleBlock => {
  const styles: RecipeStyleBlock = {};

  for (const [key, value] of Object.entries(props)) {
    if (!value || (skipReserved && RESERVED_KEYS.has(key))) continue;

    const cssProperty = PROPERTY_MAP[key];
    if (!cssProperty) continue;

    styles[cssProperty] = `var(${resolve(key, value)})`;
  }

  return styles;
};
