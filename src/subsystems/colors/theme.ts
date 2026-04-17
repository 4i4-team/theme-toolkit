import type {
  PaletteBuilderOptions,
  PaletteTokens,
  NormalizedPaletteValue,
  PalettePropertyValue,
} from "./types";
import type { SubsystemThemeHelper, SubsystemSliceContext } from "../../core/theme/helpers";
import { finalizePaletteNormalization } from "./normalize";
import { tokenizePaletteProperty, mapPaletteCssVariables } from "./tokens";
import { interpretPaletteRecipeVariant } from "./recipes";
import { lighten, darken } from "./utils";

export const createPaletteThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "colors",
    normalizeProperty: (name: string, _raw: PalettePropertyValue, normalized: unknown) =>
      finalizePaletteNormalization(name, normalized as NormalizedPaletteValue),
    tokenizeProperty: (name: string, normalized: unknown, baseToken: PaletteTokens) =>
      tokenizePaletteProperty(name, normalized as NormalizedPaletteValue, baseToken),
    mapCssVariables: (tokens: Record<string, PaletteTokens>, prefix: string) =>
      mapPaletteCssVariables(tokens, prefix),
    interpretRecipe: (variantName: string, variant: any, context: any) =>
      interpretPaletteRecipeVariant(variantName, variant, context),
    buildSlice: (context: SubsystemSliceContext) => {
      const tokens = context.tokens as Record<string, PaletteTokens>;
      const resolveBaseColor = (name: string): string => {
        const palette = tokens[name];
        if (!palette) {
          throw new Error(`Palette color "${name}" is not defined.`);
        }
        return palette.variants.main;
      };
      return {
        lighten: (name: string, percent: number) => lighten(resolveBaseColor(name), percent),
        darken: (name: string, percent: number) => darken(resolveBaseColor(name), percent),
      };
    },
  }) as unknown as SubsystemThemeHelper;
