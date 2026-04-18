import styled from "styled-components";

export const Badge = styled.span<{ $variant?: "default" | "success" | "danger" }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: var(--app-typography-font-size--sm);
  line-height: var(--app-typography-line-height);

  background: ${({ $variant }) => {
    switch ($variant) {
      case "success": return "var(--app-colors-success)";
      case "danger": return "var(--app-colors-danger)";
      default: return "var(--app-colors-neutral--light)";
    }
  }};

  color: ${({ $variant }) => {
    switch ($variant) {
      case "success": return "var(--app-colors-success--text)";
      case "danger": return "var(--app-colors-danger--text)";
      default: return "var(--app-colors-neutral--dark)";
    }
  }};
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;
