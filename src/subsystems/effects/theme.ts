import type { SubsystemThemeHelper } from "../../core/theme/helpers";
import type { EffectsTokens } from "./types";
import { tokenizeEffectsProperty, mapEffectsCssVariables } from "./tokens";
import { interpretEffectsRecipeVariant } from "./recipes";

export const createEffectsThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "effects",
    tokenizeProperty: (name: string, normalized: unknown, baseToken: unknown) =>
      tokenizeEffectsProperty(name, normalized as any, baseToken as any),
    mapCssVariables: (tokens: EffectsTokens, prefix: string) =>
      mapEffectsCssVariables(tokens, prefix),
    interpretRecipe: (variantName: string, variant: any, context: any) =>
      interpretEffectsRecipeVariant(variantName, variant, context),
  }) as unknown as SubsystemThemeHelper;
