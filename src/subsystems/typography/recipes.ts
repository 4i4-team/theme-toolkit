import { normalizeCssVariablePrefix } from "../../core/common";
import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";
import { createTypographyCssVariableResolver } from "./tokens";

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

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

export const interpretTypographyRecipeVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<Record<string, string>, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const prefix = (context.options as { prefix?: string } | undefined)?.prefix ?? "";
  const resolve = createTypographyCssVariableResolver(prefix);

  const varRef = context.resolveVariableReference;
  const base = resolveRecipeProps(variant.base, resolve, varRef);

  const responsive = variant.responsive.map(entry => {
    const overrides = resolveRecipeProps(entry as Record<string, string>, resolve, varRef, true);
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

const resolveRecipeProps = (
  props: Record<string, string>,
  resolve: (propertyKey: string, variant: string) => string,
  resolveVariableReference: (varName: string) => string,
  skipReserved = false,
): RecipeStyleBlock => {
  const styles: RecipeStyleBlock = {};

  for (const [key, value] of Object.entries(props)) {
    if (!value || (skipReserved && RESERVED_KEYS.has(key))) continue;
    const cssProperty = PROPERTY_CSS_MAP[key];
    if (!cssProperty) continue;
    styles[cssProperty] = resolveVariableReference(resolve(key, value));
  }

  return styles;
};
