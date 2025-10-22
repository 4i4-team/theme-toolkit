import { css } from "styled-components";
import { Interpolation } from "styled-components/dist/types";

type Breakpoints<T extends string> = Readonly<Record<T, number>>;
type MediaGroup = Readonly<Record<"min" | "max" | "exact", typeof css>>;
export type ThemeWithMedia<T extends string> = {
  readonly media: Readonly<Record<T, MediaGroup>>;
};

export type DefaultBreakpointKey = "xs" | "sm" | "md" | "lg" | "xl";
export type DefaultBreakpoints = Breakpoints<DefaultBreakpointKey>;

export const DEFAULT_BREAKPOINTS: DefaultBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1280,
};

export const sortBreakpointKeys = <T extends string>(
  breakpoints: Breakpoints<T>,
): T[] =>
  (Object.keys(breakpoints) as T[]).sort(
    (a, b) => breakpoints[a] - breakpoints[b],
  );

type MediaQueryOptions = {
  min?: number;
  max?: number;
};

type MediaQueryFn = (
  styles: TemplateStringsArray,
  ...interpolations: Interpolation<object>[]
) => ReturnType<typeof css>;

const createMediaQuery = (query: string): MediaQueryFn => (
  styles,
  ...interpolations
) => css`
  @media ${query} {
    ${css(styles, ...interpolations)}
  }
`;

export function mediaQuery({
  min,
  max,
}: MediaQueryOptions): typeof css {
  if (min !== undefined && max !== undefined) {
    return createMediaQuery(
      `(min-width: ${min}px) and (max-width: ${max}px)`,
    ) as typeof css;
  }

  if (min !== undefined) {
    return createMediaQuery(`(min-width: ${min}px)`) as typeof css;
  }

  if (max !== undefined) {
    return createMediaQuery(`(max-width: ${max}px)`) as typeof css;
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
