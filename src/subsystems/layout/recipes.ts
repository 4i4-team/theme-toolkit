import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";
import { createLayoutCssVariableResolver } from "./tokens";

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

const PROPERTY_CSS_MAP: Record<string, string[]> = {
  paddingY: ["padding-top", "padding-bottom"],
  paddingX: ["padding-left", "padding-right"],
  marginY: ["margin-top", "margin-bottom"],
  marginX: ["margin-left", "margin-right"],
  gap: ["gap"],
  background: ["background"],
};

export const interpretLayoutRecipeVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<Record<string, string>, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const prefix = (context.options as { prefix?: string } | undefined)?.prefix ?? "";
  const resolve = createLayoutCssVariableResolver(prefix);

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

    const cssProperties = PROPERTY_CSS_MAP[key];
    if (!cssProperties) continue;

    const resolved = key === "background" ? value : resolveVariableReference(resolve("spacing", value));
    for (const prop of cssProperties) {
      styles[prop] = resolved;
    }
  }

  return styles;
};
