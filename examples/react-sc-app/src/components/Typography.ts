import styled from "styled-components";
import { typographyMixin } from "@4i4/theme-toolkit";

// --- Headings via typographyMixin adapter ---

export const Heading1 = styled.h1`
  ${({ theme }) =>
    typographyMixin(
      theme.typography.tokens as any,
      "app",
      "heading",
      "h1",
      (theme.typography as any).recipes,
    )}
`;

export const Heading2 = styled.h2`
  ${({ theme }) =>
    typographyMixin(
      theme.typography.tokens as any,
      "app",
      "heading",
      "h2",
      (theme.typography as any).recipes,
    )}
`;

export const Heading3 = styled.h3`
  ${({ theme }) =>
    typographyMixin(
      theme.typography.tokens as any,
      "app",
      "heading",
      "h3",
      (theme.typography as any).recipes,
    )}
`;

// --- Body variants via CSS variables ---

export const BodyLarge = styled.p`
  font-size: var(--app-typography-font-size--lg);
  line-height: var(--app-typography-line-height--loose);
`;

export const Body = styled.p`
  font-size: var(--app-typography-font-size);
  line-height: var(--app-typography-line-height);
`;

export const BodySmall = styled.p`
  font-size: var(--app-typography-font-size--sm);
  line-height: var(--app-typography-line-height);
  color: #868e96;
`;

export const InlineCode = styled.code`
  font-family: var(--app-typography-font-family--mono);
  font-size: var(--app-typography-font-size--sm);
  background: #f1f3f5;
  padding: 2px 6px;
  border-radius: 4px;
`;

export const TypographyShowcase = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  > * + * {
    margin-top: 12px;
  }
`;
