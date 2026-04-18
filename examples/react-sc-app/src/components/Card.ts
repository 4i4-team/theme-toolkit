import styled from "styled-components";

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

export const Card = styled.div<{ $elevated?: boolean }>`
  background: #fff;
  overflow: hidden;
  padding: var(--app-layout-spacing--xl) var(--app-layout-spacing--xl);
  border-radius: ${({ $elevated }) =>
    $elevated ? "var(--app-effects-radius--lg)" : "var(--app-effects-radius)"};
  box-shadow: ${({ $elevated }) =>
    $elevated ? "var(--app-effects-shadow--lg)" : "var(--app-effects-shadow)"};
  transition: var(--app-effects-transition);
`;

export const HeroCard = styled.div`
  background: var(--app-colors-primary);
  color: var(--app-colors-primary--text);
  overflow: hidden;
  padding: var(--app-layout-spacing--xl) var(--app-layout-spacing--xl);
  border-radius: var(--app-effects-radius--lg);
  box-shadow: var(--app-effects-shadow--lg);
`;

export const CardTitle = styled.h3`
  font-family: var(--app-typography-font-family--heading);
  font-size: var(--app-typography-font-size--xl);
  font-weight: var(--app-typography-font-weight--semibold);
`;

export const CardBody = styled.p`
  margin-top: 8px;
  color: #555;
  font-size: var(--app-typography-font-size);
  line-height: var(--app-typography-line-height);
`;
