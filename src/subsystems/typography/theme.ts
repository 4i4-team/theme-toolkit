import type { SubsystemThemeHelper, SubsystemSliceContext } from "../../core/theme/helpers";
import type { TypographySource, TypographyBuilderOptions, TypographyTokens } from "./types";
import { finalizeTypographyNormalization } from "./normalize";
import {
  tokenizeTypographyProperty,
  mapTypographyCssVariables,
  createTypographyStyle,
} from "./tokens";
import { interpretTypographyRecipeVariant } from "./recipes";

export const createTypographyThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "typography",
    normalizeProperty: (name: string, _raw: unknown, normalized: unknown) =>
      finalizeTypographyNormalization(name, normalized as any),
    tokenizeProperty: (name: string, normalized: unknown, baseToken: unknown) =>
      tokenizeTypographyProperty(name, normalized as any, baseToken as any),
    mapCssVariables: (tokens: TypographyTokens, prefix: string) =>
      mapTypographyCssVariables(tokens, prefix, { unit: "px" }),
    interpretRecipe: (variantName: string, variant: any, context: any) =>
      interpretTypographyRecipeVariant(variantName, variant, context),
    buildSlice: (context: SubsystemSliceContext) => {
      const source = context.source as TypographySource | undefined;
      const options = context.options as TypographyBuilderOptions | undefined;
      const tokens = context.tokens as TypographyTokens | undefined;
      if (!source || !tokens) return {};
      return {
        style: (group: string, variant: string) =>
          createTypographyStyle(tokens, options?.prefix ?? "", group, variant, source.recipes as any),
      };
    },
  }) as unknown as SubsystemThemeHelper;
