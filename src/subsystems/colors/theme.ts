import type {
  PaletteBuilderOptions,
  PaletteCollection,
  PaletteTokens,
  PaletteRecipeSource,
  NormalizedPaletteValue,
  PalettePropertyValue,
} from "./types";
import type { SubsystemThemeHelper } from "../../core/theme/helpers";
import type { MediaDescriptor } from "../../core/media";
import { finalizePaletteNormalization } from "./normalize";
import { tokenizePaletteProperty, mapPaletteCssVariables } from "./tokens";
import { buildPaletteRecipes } from "./recipes";

export const createPaletteThemeHelper = (): SubsystemThemeHelper =>
  ({
    key: "palette",
    normalizeProperty: (name: string, _raw: PalettePropertyValue, normalized: unknown) =>
      finalizePaletteNormalization(name, normalized as NormalizedPaletteValue),
    tokenizeProperty: (name: string, normalized: unknown, baseToken: PaletteTokens) =>
      tokenizePaletteProperty(name, normalized as NormalizedPaletteValue, baseToken),
    mapCssVariables: (tokens: Record<string, PaletteTokens>, prefix: string) =>
      mapPaletteCssVariables(tokens, prefix),
    buildHelpers: (_source: PaletteCollection<string> | undefined) => ({}) as Record<
      string,
      PaletteTokens
    >,
    buildRecipes: (
      recipes: PaletteRecipeSource<string> | undefined,
      tokens: Record<string, PaletteTokens>,
      context: {
        breakpoints: Record<string, number>;
        media: MediaDescriptor<string>;
        options?: PaletteBuilderOptions;
      },
    ) => {
      const paletteOptions = context.options as PaletteBuilderOptions | undefined;
      return buildPaletteRecipes(recipes, tokens, {
        breakpoints: context.breakpoints as Record<string, number>,
        media: context.media as MediaDescriptor<string>,
        prefix: paletteOptions?.prefix,
        classPrefix: paletteOptions?.classPrefix,
      });
    },
  }) as unknown as SubsystemThemeHelper;
