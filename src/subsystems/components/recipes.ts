import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);
const SUBSYSTEM_KEYS = new Set(["colors", "typography", "layout", "effects"]);

export const interpretComponentsRecipeVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<Record<string, unknown>, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const cssOverrides = (variant.base.css as Record<string, string | number>) ?? {};
  const base: RecipeStyleBlock = {};

  for (const [prop, value] of Object.entries(cssOverrides)) {
    base[formatPropertyName(prop)] = value;
  }

  const responsive = variant.responsive.map(entry => {
    const entryCss = (entry as Record<string, unknown>).css as Record<string, string | number> | undefined;
    const overrides: RecipeStyleBlock = {};

    if (entryCss) {
      for (const [prop, value] of Object.entries(entryCss)) {
        overrides[formatPropertyName(prop)] = value;
      }
    }

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

export const resolveComponentReferences = (
  rawProps: Record<string, unknown>,
  getSubsystemRecipeClass: (subsystem: string, group: string, variant: string) => string | undefined,
): string[] => {
  const referenced: string[] = [];

  for (const [key, value] of Object.entries(rawProps)) {
    if (RESERVED_KEYS.has(key) || key === "css" || key === "responsive") continue;
    if (!SUBSYSTEM_KEYS.has(key) || typeof value !== "string") continue;

    const parts = value.split(".");
    if (parts.length !== 2) continue;

    const [group, variant] = parts;
    const cls = getSubsystemRecipeClass(key, group, variant);
    if (cls) {
      referenced.push(cls);
    }
  }

  return referenced;
};

const formatPropertyName = (property: string): string => {
  if (property.startsWith("--")) return property;
  return property
    .replace(/_/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
};
