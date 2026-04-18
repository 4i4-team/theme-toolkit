import styled from "styled-components";

export const TokenDemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const TokenCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => (theme.colors.tokens as any).primary?.base ?? "#4dabf7"};
  color: ${({ theme }) => (theme.colors.tokens as any).primary?.variants?.text ?? "#fff"};
  font-family: ${({ theme }) => (theme.typography.tokens as any).fontFamily?.base ?? "sans-serif"};
  font-size: ${({ theme }) => `${(theme.typography.tokens as any).fontSize?.variants?.lg ?? 20}px`};
  font-weight: ${({ theme }) => (theme.typography.tokens as any).fontWeight?.variants?.semibold ?? 600};
  box-shadow: ${({ theme }) => (theme.effects.tokens as any).shadow?.variants?.lg ?? "none"};
`;

export const TokenNeutralCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => (theme.colors.tokens as any).neutral?.variants?.light ?? "#f1f3f5"};
  color: ${({ theme }) => (theme.colors.tokens as any).neutral?.variants?.dark ?? "#343a40"};
  font-size: ${({ theme }) => `${(theme.typography.tokens as any).fontSize?.variants?.sm ?? 14}px`};
  line-height: ${({ theme }) => (theme.typography.tokens as any).lineHeight?.base ?? 1.5};
`;

export const TokenSpacingDemo = styled.div`
  display: flex;
  gap: ${({ theme }) => `${(theme.layout.tokens as any).spacing?.variants?.md ?? 12}px`};
  padding: ${({ theme }) => `${(theme.layout.tokens as any).spacing?.variants?.lg ?? 16}px`};
  background: #fff;
  border-radius: 8px;
  margin-bottom: 24px;
`;

export const TokenSpacingBox = styled.div<{ $size: string }>`
  width: ${({ theme, $size }) => `${(theme.layout.tokens as any).spacing?.variants?.[$size] ?? 8}px`};
  height: ${({ theme, $size }) => `${(theme.layout.tokens as any).spacing?.variants?.[$size] ?? 8}px`};
  background: ${({ theme }) => (theme.colors.tokens as any).primary?.base ?? "#4dabf7"};
  border-radius: 4px;
  flex-shrink: 0;
`;

export const ResponsiveTokenCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => (theme.colors.tokens as any).neutral?.variants?.light ?? "#f1f3f5"};
  color: ${({ theme }) => (theme.colors.tokens as any).neutral?.variants?.dark ?? "#343a40"};
  font-size: ${({ theme }) => `${(theme.typography.tokens as any).fontSize?.base ?? 16}px`};
  margin-bottom: 24px;

  ${({ theme }) => theme.media.md.min`
    background: ${(theme.colors.tokens as any).primary?.variants?.light ?? "#a5d8ff"};
    font-size: ${`${(theme.typography.tokens as any).fontSize?.variants?.lg ?? 20}px`};
    padding: 28px;
  `}

  ${({ theme }) => theme.media.lg.min`
    background: ${(theme.colors.tokens as any).success?.base ?? "#51cf66"};
    color: ${(theme.colors.tokens as any).success?.variants?.text ?? "#fff"};
    font-size: ${`${(theme.typography.tokens as any).fontSize?.variants?.xl ?? 24}px`};
    padding: 36px;
  `}
`;
