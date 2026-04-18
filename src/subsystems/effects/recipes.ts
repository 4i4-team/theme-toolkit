import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";
import { createEffectsCssVariableResolver } from "./tokens";

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

const PROPERTY_CSS_MAP: Record<string, string> = {
  borderRadius: "border-radius",
  boxShadow: "box-shadow",
  opacity: "opacity",
  outline: "outline",
  borderWidth: "border-width",
  blur: "filter",
  transition: "transition",
  zIndex: "z-index",
};

const RESOLVE_KEY_MAP: Record<string, string> = {
  borderRadius: "radius",
  boxShadow: "shadow",
  opacity: "opacity",
  outline: "outline",
  borderWidth: "borderWidth",
  blur: "blur",
  transition: "transitions",
  zIndex: "zIndex",
};

export const interpretEffectsRecipeVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<Record<string, string>, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const prefix = (context.options as { prefix?: string } | undefined)?.prefix ?? "";
  const resolve = createEffectsCssVariableResolver(prefix);

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

    const resolveKey = RESOLVE_KEY_MAP[key];
    if (key === "blur") {
      styles[cssProperty] = `blur(${resolveVariableReference(resolve(resolveKey, value))})`;
    } else {
      styles[cssProperty] = resolveVariableReference(resolve(resolveKey, value));
    }
  }

  return styles;
};
