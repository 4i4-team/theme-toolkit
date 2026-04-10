import { media } from "./media-query";
import type {
  Breakpoints,
  ThemeWithMedia,
} from "./media-query";

type ThemeWithBreakpoints<T extends string> = {
  breakpoints: Breakpoints<T>;
};

export function createTheme<
  T extends string,
  TTheme extends ThemeWithBreakpoints<T>,
>(theme: TTheme): TTheme & ThemeWithMedia<T> {
  const clone = { ...theme } as TTheme & ThemeWithMedia<T>;

  let cachedBreakpoints = clone.breakpoints;
  let cachedMedia = media(cachedBreakpoints);

  Object.defineProperty(clone, "media", {
    get() {
      const currentBreakpoints = (this as typeof clone).breakpoints;
      if (currentBreakpoints !== cachedBreakpoints) {
        cachedBreakpoints = currentBreakpoints;
        cachedMedia = media(currentBreakpoints);
      }

      return cachedMedia;
    },
    enumerable: true,
    configurable: true,
  });

  return clone;
}
