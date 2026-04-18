import styled from "styled-components";

export const Nav = styled.nav`
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 0 32px;
  display: flex;
  gap: 4px;
`;

export const NavTab = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? "#1c7ed6" : "#495057")};
  border-bottom: 2px solid ${({ $active }) => ($active ? "#1c7ed6" : "transparent")};
  font-size: 0.9rem;
  transition: color 150ms ease;

  &:hover {
    color: #1c7ed6;
  }
`;
