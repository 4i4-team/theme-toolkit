import styled, { css } from "styled-components";

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
`;

export const Button = styled.button<{ $variant?: "primary" | "primary-sm" | "danger" }>`
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--app-effects-radius);
  box-shadow: var(--app-effects-shadow);
  transition: var(--app-effects-transition);

  ${({ theme, $variant = "primary" }) => {
    const typoStyle = $variant === "primary-sm"
      ? theme.typography.style("button", "small")
      : theme.typography.style("button", "large");

    return css`
      font-size: ${typoStyle["font-size"]};
      font-weight: ${typoStyle["font-weight"]};
      padding: ${$variant === "primary-sm" ? "6px 12px" : "12px 24px"};
    `;
  }}

  &:hover {
    opacity: 0.9;
  }
`;

export const GhostButton = styled.button`
  cursor: pointer;
  border: none;
  background: transparent;
  color: inherit;
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: #f1f3f5;
    border-radius: 6px;
  }
`;
