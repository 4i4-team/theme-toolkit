import type {
  InterpretedRecipeVariant,
  NormalizedRecipeVariant,
  RecipeResponsiveOverride,
  RecipeStyleBlock,
  ResolveCssVariableName,
} from "../../core/common";
import type { RecipeInterpretContext } from "../../core/theme/helpers";
import type {
  PaletteRecipeProps,
  PaletteTokens,
} from "./types";

const RESERVED_RECIPE_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

export const interpretPaletteRecipeVariant = (
  variantName: string,
  variant: NormalizedRecipeVariant<PaletteRecipeProps, string>,
  context: RecipeInterpretContext<string>,
): InterpretedRecipeVariant<string> => {
  const tokens = context.tokens as Record<string, PaletteTokens>;
  const path = `${context.groupPath}.${variantName}`;

  const base = interpretRecipeProps(
    variant.base,
    tokens,
    context.resolveCssVariable,
    path,
  );

  const responsive = variant.responsive.map(entry => {
    if (entry.target && entry.target !== variantName) {
      throw new Error(
        `Responsive recipe entry for ${path} cannot target "${entry.target}".`,
      );
    }

    const inherited = entry.variant
      ? { ...context.resolveRecipeVariant(entry.variant).base }
      : {};

    const overrides = interpretRecipeProps(
      entry as unknown as PaletteRecipeProps,
      tokens,
      context.resolveCssVariable,
      `${path}.responsive`,
    );

    return {
      ...inherited,
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

const interpretRecipeProps = <TColor extends string>(
  props: PaletteRecipeProps | undefined,
  tokens: Record<TColor, PaletteTokens>,
  resolveCssVariable: ResolveCssVariableName,
  path: string,
): RecipeStyleBlock => {
  const styles: RecipeStyleBlock = {};
  if (!props) {
    return styles;
  }

  Object.entries(props).forEach(([property, value]) => {
    if (value === undefined || RESERVED_RECIPE_KEYS.has(property)) {
      return;
    }

    const resolved = resolvePaletteReference(value, tokens, resolveCssVariable, path, property);
    if (resolved === undefined || resolved === "") {
      return;
    }

    styles[formatPropertyName(property)] = resolved;
  });

  return styles;
};

const resolvePaletteReference = <TColor extends string>(
  value: string | number,
  tokens: Record<TColor, PaletteTokens>,
  resolveCssVariable: ResolveCssVariableName,
  path: string,
  property: string,
): string | number => {
  if (typeof value === "number") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const segments = trimmed.split(".");
  const paletteName = segments[0] as TColor;
  const palette = tokens[paletteName];

  if (!palette) {
    return trimmed;
  }

  const subKey = segments.length > 1 ? segments.slice(1).join(".") : undefined;

  if (!subKey) {
    return `var(${resolveCssVariable(paletteName as string)})`;
  }

  if (subKey === "text") {
    return `var(${resolveCssVariable(paletteName as string, undefined, "text")})`;
  }

  if (!palette.variants[subKey]) {
    throw new Error(
      `Unknown palette variant reference "${String(paletteName)}.${subKey}" in ${path}.${property}.`,
    );
  }

  return `var(${resolveCssVariable(paletteName as string, subKey)})`;
};

const formatPropertyName = (property: string): string => {
  if (property.startsWith("--")) {
    return property;
  }

  return property
    .replace(/_/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
};
