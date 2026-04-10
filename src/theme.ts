import { media } from "./media-query";
import type {
  Breakpoints,
  MediaConfig,
  ThemeWithMedia,
} from "./media-query";
import { buildPaletteTokens, lighten, darken } from "./colors";
import type {
  PaletteBuilderOptions,
  PaletteSource,
  PaletteTokens,
} from "./colors";

type TypographySettings = {
  rootFontSize?: number;
};

type ThemeWithBreakpoints<T extends string, TPaletteKey extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySettings;
  palette?: Record<TPaletteKey, PaletteSource>;
};

type PaletteDerived<TPaletteKey extends string> = {
  paletteTokens: Record<TPaletteKey, PaletteTokens>;
  paletteCSS: string;
};

type ThemeWithPalette<TPaletteKey extends string> = PaletteDerived<TPaletteKey> & {
  lightenColor: (name: TPaletteKey, percent: number) => string;
  darkenColor: (name: TPaletteKey, percent: number) => string;
};

type CreateThemeOptions = {
  media?: MediaConfig;
  palette?: PaletteBuilderOptions;
};

const resolveMediaConfig = <
  T extends string,
  TPaletteKey extends string,
  TTheme extends ThemeWithBreakpoints<T, TPaletteKey>,
>(
  theme: TTheme,
  overrides?: MediaConfig,
): MediaConfig => ({
  unit: overrides?.unit,
  baseFontSize: overrides?.baseFontSize ?? theme.typography?.rootFontSize,
});

const buildPaletteHelpers = <TPaletteKey extends string>(
  paletteSource: Record<TPaletteKey, PaletteSource> | undefined,
  options?: PaletteBuilderOptions,
): PaletteDerived<TPaletteKey> => {
  if (!paletteSource) {
    return {
      paletteTokens: {} as Record<TPaletteKey, PaletteTokens>,
      paletteCSS: "",
    };
  }

  const { tokens, toCSS } = buildPaletteTokens(paletteSource, options);

  return {
    paletteTokens: tokens,
    paletteCSS: toCSS(),
  };
};

export function createTheme<
  T extends string,
  TPaletteKey extends string,
  TTheme extends ThemeWithBreakpoints<T, TPaletteKey>,
>(
  theme: TTheme,
  options?: CreateThemeOptions,
): TTheme & ThemeWithMedia<T> & ThemeWithPalette<TPaletteKey> {
  const clone = { ...theme } as TTheme &
    ThemeWithMedia<T> &
    ThemeWithBreakpoints<T, TPaletteKey> &
    ThemeWithPalette<TPaletteKey>;

  let cachedBreakpoints = clone.breakpoints;
  let cachedMediaConfig = resolveMediaConfig(clone, options?.media);
  let cachedMedia = media(cachedBreakpoints, cachedMediaConfig);
  let cachedPaletteSource = clone.palette;
  let cachedPalette = buildPaletteHelpers(cachedPaletteSource, options?.palette);

  Object.defineProperty(clone, "media", {
    get() {
      const currentTheme = this as typeof clone;
      const currentBreakpoints = currentTheme.breakpoints;
      const currentConfig = resolveMediaConfig(currentTheme, options?.media);

      const configChanged =
        currentConfig.unit !== cachedMediaConfig.unit ||
        currentConfig.baseFontSize !== cachedMediaConfig.baseFontSize;

      if (currentBreakpoints !== cachedBreakpoints || configChanged) {
        cachedBreakpoints = currentBreakpoints;
        cachedMediaConfig = currentConfig;
        cachedMedia = media(currentBreakpoints, currentConfig);
      }

      return cachedMedia;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "paletteTokens", {
    get() {
      const currentTheme = this as typeof clone;
      if (currentTheme.palette !== cachedPaletteSource) {
        cachedPaletteSource = currentTheme.palette;
        cachedPalette = buildPaletteHelpers(
          cachedPaletteSource,
          options?.palette,
        );
      }

      return cachedPalette.paletteTokens;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "paletteCSS ", {
    get() {
      // ensure tokens are up to date
      void clone.paletteTokens;
      return cachedPalette.paletteCSS;
    },
    enumerable: true,
    configurable: true,
  });

  const resolveBaseColor = (name: TPaletteKey): string => {
    const tokens = clone.paletteTokens;
    const palette = tokens[name];
    if (!palette) {
      throw new Error(`Palette color "${String(name)}" is not defined.`);
    }
    return palette.variants.main;
  };

  Object.defineProperty(clone, "lightenColor", {
    value: (name: TPaletteKey, percent: number) =>
      lighten(resolveBaseColor(name), percent),
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(clone, "darkenColor", {
    value: (name: TPaletteKey, percent: number) =>
      darken(resolveBaseColor(name), percent),
    enumerable: true,
    configurable: true,
  });

  return clone;
}
