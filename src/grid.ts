import { css } from "styled-components";
import { RuleSet } from "styled-components/dist/types";

import {
  Breakpoints,
  ThemeWithMedia,
  sortBreakpointKeys,
} from "./media-query";

export function container<T extends string>(
  breakpoints: Breakpoints<T>,
): RuleSet<ThemeWithMedia<T>> {
  const keys = sortBreakpointKeys(breakpoints);

  return css`
    ${keys.map(key => css`
      ${({ theme }) => {
        const themed = theme as ThemeWithMedia<T>;
        let width: number | string = Math.max(0, breakpoints[key]);

        if (width === 0) {
          width = "auto";
        } else {
          width = `${width}px`;
        }

        return themed.media[key].min`
          --container-width: ${width};
        `;
      }}
    `)};
  `;
}

export function columnSizes(size: number): Record<string, number> {
  const sizes = Array.from({ length: size }, (_, index) => index + 1);

  return sizes.reduce<Record<string, number>>((accumulator, current) => {
    accumulator[current.toString()] = (current * 100) / size;
    return accumulator;
  }, {});
}

export function buildBreakpointColumnSizes<T extends string>(
  sizes: number[],
  breakpoint: T,
): RuleSet<ThemeWithMedia<T>> {
  return css`
    ${({ theme }) => {
      const themed = theme as ThemeWithMedia<T>;

      return themed.media[breakpoint].min`
        ${sizes.map(size => css`
          &.${breakpoint}-${size} {
            grid-column-end: span ${size};
          }

          &.offset-${breakpoint}-${size} {
            grid-column-start: ${size + 1};
          }
        `)}
      `;
    }}
  `;
}

export function buildColumn<T extends string>(
  size: number,
  breakpoints: Breakpoints<T>,
): RuleSet<ThemeWithMedia<T>> {
  const sizes = Array.from({ length: size }, (_, index) => index + 1);
  const keys = sortBreakpointKeys(breakpoints);

  return css`
    ${keys.map(key => buildBreakpointColumnSizes(sizes, key))};
  `;
}
