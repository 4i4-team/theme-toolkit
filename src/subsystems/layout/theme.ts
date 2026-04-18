import type { SubsystemThemeHelper, SubsystemSliceContext } from "../../core/theme/helpers";
import type { CssRuleNode, CssVariablesNode } from "../../core/common";
import type { MediaDescriptor } from "../../core/media";
import type { LayoutSource, LayoutTokens, LayoutBuilderOptions } from "./types";
import { finalizeLayoutNormalization } from "./normalize";
import {
  tokenizeLayoutProperty,
  mapLayoutCssVariables,
  createLayoutCssVariableResolver,
  buildColumnsNodes,
  buildGridNodes,
  buildStackNodes,
  buildContainerNodes,
} from "./tokens";
import { interpretLayoutRecipeVariant } from "./recipes";

export const createLayoutThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "layout",
    normalizeProperty: (name: string, _raw: unknown, normalized: unknown) =>
      finalizeLayoutNormalization(name, normalized as any),
    tokenizeProperty: (name: string, normalized: unknown, baseToken: unknown) =>
      tokenizeLayoutProperty(name, normalized as any, baseToken as any),
    mapCssVariables: (tokens: LayoutTokens, prefix: string) =>
      mapLayoutCssVariables(tokens, prefix),
    interpretRecipe: (variantName: string, variant: any, context: any) =>
      interpretLayoutRecipeVariant(variantName, variant, context),
    buildSlice: (context: SubsystemSliceContext) => {
      const source = context.source as LayoutSource | undefined;
      const options = context.options as LayoutBuilderOptions | undefined;
      if (!source) return {};

      return {};
    },
  }) as unknown as SubsystemThemeHelper;
