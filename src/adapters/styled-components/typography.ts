import { css } from "styled-components";
import { createTypographyStyle } from "../../subsystems/typography";
import type { TypographyTokens, TypographyStyles } from "../../subsystems/typography";

export const typographyMixin = (
  tokens: TypographyTokens,
  recipes: TypographyStyles | undefined,
  group: string,
  variant: string,
) => {
  const styles = createTypographyStyle(tokens, recipes, group, variant);

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
