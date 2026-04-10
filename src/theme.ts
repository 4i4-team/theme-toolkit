import { media } from "./media-query";
import type {
  Breakpoints,
  MediaConfig,
  ThemeWithMedia,
} from "./media-query";

type TypographySettings = {
  rootFontSize?: number;
};

type ThemeWithBreakpoints<T extends string> = {
  breakpoints: Breakpoints<T>;
  typography?: TypographySettings;
};

type CreateThemeOptions = {
  media?: MediaConfig;
};

const resolveMediaConfig = <T extends string, TTheme extends ThemeWithBreakpoints<T>>(
  theme: TTheme,
  overrides?: MediaConfig,
): MediaConfig => ({
  unit: overrides?.unit,
  baseFontSize: overrides?.baseFontSize ?? theme.typography?.rootFontSize,
});

export function createTheme<
  T extends string,
  TTheme extends ThemeWithBreakpoints<T>,
>(theme: TTheme, options?: CreateThemeOptions): TTheme & ThemeWithMedia<T> {
  const clone = { ...theme } as TTheme & ThemeWithMedia<T> &
    ThemeWithBreakpoints<T>;

  let cachedBreakpoints = clone.breakpoints;
  let cachedMediaConfig = resolveMediaConfig(clone, options?.media);
  let cachedMedia = media(cachedBreakpoints, cachedMediaConfig);

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

  return clone;
}
