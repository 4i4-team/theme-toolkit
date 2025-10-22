import { css } from "styled-components";
import { Interpolation, Styles } from "styled-components/dist/types";

type Breakpoints<T extends string> = Record<T, number>;
type MediaGroup = Record<"min" | "max" | "exact", typeof css>;
export type ThemeWithMedia<T extends string> = { media: Record<T, MediaGroup> };

export const sortBreakpointKeys = <T extends string>(
  breakpoints: Breakpoints<T>,
): T[] =>
  (Object.keys(breakpoints) as T[]).sort(
    (a, b) => breakpoints[a] - breakpoints[b],
  );

export function mediaQuery({
  min,
  max,
}: {
  min?: number;
  max?: number;
}): typeof css {
  if (min && max) {
    return ((
      styles: Styles<object>,
      ...interpolations: Interpolation<object>[]
    ) => css`
      @media (min-width: ${min}px) and (max-width: ${max}px) {
        ${css(styles, ...interpolations)}
      }
    `) as typeof css;
  }

  if (min) {
    return ((
      styles: Styles<object>,
      ...interpolations: Interpolation<object>[]
    ) => css`
      @media (min-width: ${min}px) {
        ${css(styles, ...interpolations)}
      }
    `) as typeof css;
  }

  if (max) {
    return ((
      styles: Styles<object>,
      ...interpolations: Interpolation<object>[]
    ) => css`
      @media (max-width: ${max}px) {
        ${css(styles, ...interpolations)}
      }
    `) as typeof css;
  }

  return css;
}

export function breakpoint({
  min,
  max,
}: {
  min?: number;
  max?: number;
}): MediaGroup {
  return {
    min: mediaQuery({ min }),
    max: mediaQuery({ max }),
    exact: mediaQuery({ min, max }),
  };
}

export function media<T extends string>(
  breakpoints: Breakpoints<T>,
): Record<T, MediaGroup> {
  const keys = sortBreakpointKeys(breakpoints);

  return keys.reduce<Record<T, MediaGroup>>((accumulator, key, index) => {
    const min = breakpoints[key];
    const nextKey = keys[index + 1];
    const max = nextKey ? breakpoints[nextKey] : undefined;

    accumulator[key] = breakpoint({ min, max });
    return accumulator;
  }, {} as Record<T, MediaGroup>);
}

export type { Breakpoints, MediaGroup };
