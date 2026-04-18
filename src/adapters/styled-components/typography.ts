import { css } from "styled-components";
import { createTypographyStyle } from "../../subsystems/typography";
import type { TypographyTokens } from "../../subsystems/typography";

export const typographyMixin = (
  tokens: TypographyTokens,
  prefix: string,
  group: string,
  variant: string,
  recipes?: Record<string, Record<string, Record<string, unknown>>>,
) => {
  const styles = createTypographyStyle(tokens, prefix, group, variant, recipes);

  const mixin = css`
    font-family: ${styles.fontFamily};
    font-size: ${styles.fontSize};
    font-weight: ${styles.fontWeight};
    line-height: ${styles.lineHeight};
    letter-spacing: ${styles.letterSpacing};
  `;

  Object.defineProperty(mixin, "toString", {
    value: () =>
      `font-family: ${styles.fontFamily};font-size: ${styles.fontSize};font-weight: ${styles.fontWeight};line-height: ${styles.lineHeight};letter-spacing: ${styles.letterSpacing};`,
    configurable: true,
  });

  return mixin;
};
