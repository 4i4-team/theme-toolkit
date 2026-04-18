import styled from "styled-components";

export const ResponsiveBox = styled.div`
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.md.min`
    border-color: var(--app-colors-primary);
    background: var(--app-colors-primary--light);
  `}

  ${({ theme }) => theme.media.lg.min`
    border-color: var(--app-colors-success);
    background: #d3f9d8;
  `}
`;

export const ResponsiveLabel = styled.span`
  font-weight: 600;
  font-size: 0.9rem;

  &::after {
    content: " — < sm";
    font-weight: 400;
    color: #868e96;
  }

  ${({ theme }) => theme.media.md.min`
    &::after { content: " — md+"; }
  `}

  ${({ theme }) => theme.media.lg.min`
    &::after { content: " — lg+"; }
  `}
`;
