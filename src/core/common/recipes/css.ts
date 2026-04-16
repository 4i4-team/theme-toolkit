import type { MediaDescriptor } from "../../media";
import type { CssDeclaration, CssRuleNode } from "../cssNodes";
import type { RecipeResponsiveOverride } from "../types";

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

const RESERVED_KEYS = new Set(["breakpoint", "query", "variant", "target"]);

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
      const mediaGroup = options.media[entry.breakpoint];
      if (!mediaGroup) return;
      const mediaQuery = mediaGroup[entry.query];
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
