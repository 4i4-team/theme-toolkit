import styled from "styled-components";

export const Grid = styled.div`
  ${({ theme }) => theme.layoutColumnsMixin()}
  gap: 16px;
`;
