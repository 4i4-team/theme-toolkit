import { css } from "styled-components";
import { RuleSet } from "styled-components/dist/types";

import {
  Breakpoints,
  ThemeWithMedia,
  sortBreakpointKeys,
} from "./media-query";

const mergeRules = <Props extends object>(
  chunks: Array<RuleSet<Props>>,
): RuleSet<Props> =>
  chunks.reduce<RuleSet<Props>>((accumulator, chunk) => {
    return css<Props>`${accumulator}${chunk}`;
  }, css<Props>``);

export function container<T extends string>(
  breakpoints: Breakpoints<T>,
): RuleSet<ThemeWithMedia<T>> {
  const keys = sortBreakpointKeys(breakpoints);

  const rules = keys.map(key => css`
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
  `);

  return mergeRules(rules);
}

export function columnSizes(size: number): Record<number, number> {
  const sizes = Array.from({ length: size }, (_, index) => index + 1);

  return sizes.reduce<Record<number, number>>((accumulator, current) => {
    accumulator[current] = (current * 100) / size;
    return accumulator;
  }, {});
}

export function buildBreakpointColumnSizes<T extends string>(
  sizes: number[],
  breakpoint: T,
): RuleSet<ThemeWithMedia<T>> {
  const rules = sizes.map(size => css`
    &.${breakpoint}-${size} {
      grid-column-end: span ${size};
    }

    &.offset-${breakpoint}-${size} {
      grid-column-start: ${size + 1};
    }
  `);

  return css`
    ${({ theme }) => {
      const themed = theme as ThemeWithMedia<T>;

      return themed.media[breakpoint].min`
        ${mergeRules(rules)}
      `;
    }}
  `;
}

export function buildColumn<T extends string>(
  size: number,
  breakpoints: Breakpoints<T>,
): RuleSet<ThemeWithMedia<T>> {
  const sizes = Array.from({ length: size }, (_, index) => index + 1);
  const keys = [...sortBreakpointKeys(breakpoints)] as readonly T[];

  const rules = keys.map(key => buildBreakpointColumnSizes(sizes, key));

  return mergeRules(rules);
}
