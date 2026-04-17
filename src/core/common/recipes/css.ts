import type { MediaDescriptor } from "../../media";
import type { CssDeclaration, CssRuleNode } from "../cssNodes";
import type { RecipeResponsiveOverride, ResponsiveOrientation } from "../types";

export type RecipeStyleBlock = Record<string, string | number>;

export type InterpretedRecipeVariant<TBreakpoint extends string> = {
  base: RecipeStyleBlock;
  responsive: Array<
    RecipeResponsiveOverride<RecipeStyleBlock, TBreakpoint> & {
      query: "min" | "max" | "exact";
    }
  >;
};

export type InterpretedRecipeGroup<TBreakpoint extends string> = Record<
  string,
  InterpretedRecipeVariant<TBreakpoint>
>;

export type GenerateRecipeCssResult = {
  nodes: CssRuleNode[];
  variants: Record<string, string>;
};

export type GenerateRecipeCssOptions<TBreakpoint extends string> = {
  media: MediaDescriptor<TBreakpoint>;
  selectorBuilder: (variantName: string) => string;
};

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target", "orientation"]);

const resolveRecipeMediaQuery = <TBreakpoint extends string>(
  media: MediaDescriptor<TBreakpoint>,
  breakpoint: TBreakpoint,
  query: "min" | "max" | "exact",
  orientation?: ResponsiveOrientation,
): string => {
  if (!orientation) {
    const group = media[breakpoint];
    return group?.[query] ?? "";
  }
  const opts = { orientation };
  if (query === "min") return media.min(breakpoint, opts);
  if (query === "max") return media.max(breakpoint, opts);
  return media.exact(breakpoint, opts);
};

export const generateRecipeCss = <TBreakpoint extends string>(
  group: InterpretedRecipeGroup<TBreakpoint>,
  options: GenerateRecipeCssOptions<TBreakpoint>,
): GenerateRecipeCssResult => {
  const nodes: CssRuleNode[] = [];
  const variants: Record<string, string> = {};

  Object.entries(group).forEach(([variantName, variant]) => {
    const selector = options.selectorBuilder(variantName);
    variants[variantName] = selector;

    const baseDeclarations = toDeclarations(variant.base, false);
    if (baseDeclarations.length) {
      nodes.push({ kind: "rule", selector, declarations: baseDeclarations });
    }

    variant.responsive.forEach(entry => {
      const mediaQuery = resolveRecipeMediaQuery(
        options.media,
        entry.breakpoint,
        entry.query,
        entry.orientation,
      );
      if (!mediaQuery) return;

      const declarations = toDeclarations(entry as RecipeStyleBlock, true);
      if (!declarations.length) return;

      nodes.push({
        kind: "rule",
        selector,
        media: mediaQuery,
        declarations,
      });
    });
  });

  return { nodes, variants };
};

const toDeclarations = (
  block: Record<string, string | number>,
  skipReserved: boolean,
): CssDeclaration[] => {
  const entries = Object.entries(block).filter(([key]) =>
    skipReserved ? !RESERVED_KEYS.has(key) : true,
  );
  return entries.map(([property, value]) => ({ property, value }));
};
